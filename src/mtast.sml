(*
    Copyright 2018 Fernando Borretti <fernando@borretti.me>

    This file is part of Boreal.

    Boreal is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Boreal is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Boreal.  If not, see <http://www.gnu.org/licenses/>.
*)

structure MTAST :> MTAST = struct
    type name = Symbol.symbol
    type ty = MonoType.ty

    (* Expression AST *)

    datatype ast = UnitConstant
                 | BoolConstant of bool
                 | IntConstant of string * ty
                 | FloatConstant of string * ty
                 | StringConstant of CST.escaped_string
                 | Variable of Symbol.variable * ty
                 | Let of Symbol.variable * ast * ast
                 | Bind of Symbol.variable list * ast * ast
                 | Cond of ast * ast * ast
                 | ArithOp of Arith.kind * Arith.oper * ast * ast
                 | TupleCreate of ast list
                 | TupleProj of ast * int
                 | ArrayLength of ast
                 | ArrayPointer of ast
                 | Allocate of ast
                 | Load of ast
                 | Store of ast * ast
                 | Construct of ty * name * ast option
                 | Case of ast * variant_case list * ty
                 | ForeignFuncall of string * ast list * ty
                 | ForeignNull of ty
                 | SizeOf of ty
                 | AddressOf of Symbol.variable * ty
                 | Cast of ty * ast
                 | Seq of ast * ast
                 | ConcreteFuncall of name * ast list * ty
                 | GenericFuncall of name * int * ty list * ast list * ty
         and variant_case = VariantCase of case_name * ast
         and case_name = NameOnly of name
                       | NameBinding of { casename: name, var: Symbol.variable, ty: ty }

    (* Block AST *)

    datatype top_ast = Defun of name * param list * ty * ast
                     | DefunMonomorph of name * param list * ty * ast * int
                     | DeftypeMonomorph of name * ty * int
                     | ToplevelProgn of top_ast list
         and param = Param of Symbol.variable * ty

    (* Fresh monomorph ids *)

    val id = ref 0

    fun freshId () =
        let
        in
            id := !id + 1;
            !id
        end

    (* Monomorphization *)

    type type_monomorphs = MonoType.type_monomorphs
    type replacements = MonoType.replacements

    datatype fn_monomorphs = FuncMonos of ((name * ty list), int) Map.map

    datatype context = Context of type_monomorphs * replacements * fn_monomorphs

    val emptyContext =
        Context (MonoType.emptyMonomorphs,
                 Map.empty,
                 FuncMonos Map.empty)

    fun getMonomorph (Context (_, _, FuncMonos fm)) name tyargs =
        Map.get fm (name, tyargs)

    fun addMonomorph (Context (tm, rs, FuncMonos fm)) name tyargs id =
        Context (tm, rs, FuncMonos (Map.iadd fm ((name, tyargs), id)))

    (* Diffing contexts *)

    fun newFuncMonomorphs (Context (_, _, FuncMonos old)) (Context (_, _, FuncMonos new)) =
        let val oldKeys = Map.keys old
            and newKeys = Map.keys new
        in
            let val newKeys' = Set.minus newKeys oldKeys
            in
                map (fn k =>
                        let val id = Option.valOf (Map.get new k)
                            and (name, args) = k
                        in
                            (name, args, id)
                        end)
                    (Set.toList newKeys')
            end
        end

    fun newTypeMonomorphs (Context (old, _, _)) (Context (new, _, _)) =
        MonoType.newMonomorphs old new

    (* Monomorphization utilities *)

    fun monoType ctx ty =
        let val (Context (tm, rs, fm)) = ctx
        in
            let val (ty', tm') = MonoType.monomorphize tm rs ty
            in
                (ty', Context (tm', rs, fm))
            end
        end

    fun monoTypes ctx tys =
        Util.foldThread (fn (ty, ctx) => monoType ctx ty)
                        tys
                        ctx

    fun forciblyMonomorphize ctx ty =
        (* ONLY USE THIS when you can ignore resulting monomorphs, e.g. in a
           defun or some other provably-concrete context *)
        let val (Context (tm, rs, _)) = ctx
        in
            let val (ty', _) = MonoType.monomorphize tm
                                                     rs
                                                     ty
            in
                ty'
            end
        end

    (* Monomorphize a type with an empty replacements map, that is, in a
       concrete context. *)

    fun monomorphize ctx TAST.UnitConstant =
        (UnitConstant, ctx)
      | monomorphize ctx (TAST.BoolConstant b) =
        (BoolConstant b, ctx)
      | monomorphize ctx (TAST.IntConstant (i, ty)) =
        let val ty' = forciblyMonomorphize ctx ty
        in
            case ty' of
                (MonoType.Integer _) => (IntConstant (i, ty'), ctx)
              | _ => raise Fail "Internal error: not a valid type for an integer constant"
        end
      | monomorphize ctx (TAST.FloatConstant (f, ty)) =
        let val ty' = forciblyMonomorphize ctx ty
        in
            case ty' of
                (MonoType.Float _) => (FloatConstant (f, ty'), ctx)
              | _ => raise Fail "Internal error: not a valid type for a float constant"
        end
      | monomorphize ctx (TAST.StringConstant s) =
        (StringConstant s, ctx)
      | monomorphize ctx (TAST.Variable (var, ty)) =
        let val (ty', ctx) = monoType ctx ty
        in
            (Variable (var, ty'), ctx)
        end
      | monomorphize ctx (TAST.Let (name, value, body)) =
        let val (value', ctx) = monomorphize ctx value
        in
            let val (body', ctx) = monomorphize ctx body
            in
                (Let (name, value', body'), ctx)
            end
        end
      | monomorphize ctx (TAST.Bind (names, tup, body)) =
        let val (tup', ctx) = monomorphize ctx tup
        in
            let val (body', ctx) = monomorphize ctx body
            in
                (Bind (names, tup', body'), ctx)
            end
        end
      | monomorphize ctx (TAST.Cond (t, c, a)) =
        let val (t', ctx) = monomorphize ctx t
        in
            let val (c', ctx) = monomorphize ctx c
            in
                let val (a', ctx) = monomorphize ctx a
                in
                    (Cond (t', c', a'), ctx)
                end
            end
        end
      | monomorphize ctx (TAST.ArithOp (kind, oper, lhs, rhs)) =
        let val (lhs', ctx) = monomorphize ctx lhs
        in
            let val (rhs', ctx) = monomorphize ctx rhs
            in
                (ArithOp (kind, oper, lhs', rhs'), ctx)
            end
        end
      | monomorphize ctx (TAST.TupleCreate exps) =
        let val (exps', ctx) = monomorphizeList ctx exps
        in
            (TupleCreate exps', ctx)
        end
      | monomorphize ctx (TAST.TupleProj (tup, idx)) =
        let val (tup', ctx) = monomorphize ctx tup
        in
            (TupleProj (tup', idx), ctx)
        end
      | monomorphize ctx (TAST.ArrayLength arr) =
        let val (arr', ctx) = monomorphize ctx arr
        in
            (ArrayLength arr', ctx)
        end
      | monomorphize ctx (TAST.ArrayPointer arr) =
        let val (arr', ctx) = monomorphize ctx arr
        in
            (ArrayPointer arr', ctx)
        end
      | monomorphize ctx (TAST.Allocate exp) =
        let val (exp', ctx) = monomorphize ctx exp
        in
            (Allocate exp', ctx)
        end
      | monomorphize ctx (TAST.Load exp) =
        let val (exp', ctx) = monomorphize ctx exp
        in
            (Load exp', ctx)
        end
      | monomorphize ctx (TAST.Store (ptr, value)) =
        let val (ptr', ctx) = monomorphize ctx ptr
        in
            let val (value', ctx) = monomorphize ctx value
            in
                (Store (ptr', value'), ctx)
            end
        end
      | monomorphize ctx (TAST.The (_, exp)) =
        (* The MTAST doesn't have a case for `the` expressions. Since type
           checking is done at the TAST level, we don't need one. We ignore the
           provided type and monomorphize the expression. *)
        let val (exp', ctx) = monomorphize ctx exp
        in
            (exp', ctx)
        end
      | monomorphize ctx (TAST.Construct (ty, name, expOpt)) =
        let val (ty', ctx) = monoType ctx ty
        in
            case expOpt of
                (SOME exp) => let val (exp', ctx) = monomorphize ctx exp
                              in
                                  (Construct (ty', name, SOME exp'), ctx)
                              end
              | NONE => (Construct (ty', name, NONE), ctx)
        end
      | monomorphize ctx (TAST.Case (exp, cases, ty)) =
        let val (exp', ctx) = monomorphize ctx exp
        in
            let fun monomorphizeCases ctx cases =
                    Util.foldThread (fn (c, ctx) =>
                                      monomorphizeCase ctx c)
                                    cases
                                    ctx

                and monomorphizeCase ctx (TAST.VariantCase (name, body)) =
                    let val (body', ctx) = monomorphize ctx body
                    in
                        let val (name', ctx) = mapName ctx name
                        in
                            (VariantCase (name', body'), ctx)
                        end
                    end

                and mapName ctx (TAST.NameOnly name) =
                    (NameOnly name, ctx)
                  | mapName ctx (TAST.NameBinding { casename, var, ty}) =
                    let val (ty', ctx) = monoType ctx ty
                    in
                        (NameBinding { casename = casename, var = var, ty = ty' }, ctx)
                    end

            in
                let val (cases', ctx) = monomorphizeCases ctx cases
                in
                    let val (ty', ctx) = monoType ctx ty
                    in
                        (Case (exp', cases', ty'), ctx)
                    end
                end
            end
        end
      | monomorphize ctx (TAST.ForeignFuncall (name, args, ty)) =
        let val (args', exp) = monomorphizeList ctx args
        in
            let val (ty', exp) = monoType ctx ty
            in
                (ForeignFuncall (name, args', ty'), ctx)
            end
        end
      | monomorphize ctx (TAST.ForeignNull ty) =
        let val (ty', ctx) = monoType ctx ty
        in
            (ForeignNull ty', ctx)
        end
      | monomorphize ctx (TAST.SizeOf ty) =
        let val (ty', ctx) = monoType ctx ty
        in
            (SizeOf ty', ctx)
        end
      | monomorphize ctx (TAST.AddressOf (var, ty)) =
        let val (ty', ctx) = monoType ctx ty
        in
            (AddressOf (var, ty'), ctx)
        end
      | monomorphize ctx (TAST.Cast (ty, exp)) =
        let val (ty', ctx) = monoType ctx ty
        in
            let val (exp', ctx) = monomorphize ctx exp
            in
                (Cast (ty', exp'), ctx)
            end
        end
      | monomorphize ctx (TAST.Seq (a, b)) =
        let val (a', ctx) = monomorphize ctx a
        in
            let val (b', ctx) = monomorphize ctx b
            in
                (Seq (a', b'), ctx)
            end
        end
      | monomorphize ctx (TAST.ConcreteFuncall (name, args, ty)) =
        let val (args', ctx) = monomorphizeList ctx args
        in
            let val (ty', ctx) = monoType ctx ty
            in
                (ConcreteFuncall (name, args', ty'), ctx)
            end
        end
      | monomorphize ctx (TAST.GenericFuncall (name, tyargs, args, ty)) =
        let val (tyargs', ctx) = monoTypes ctx tyargs
        in
            let val (args', ctx) = monomorphizeList ctx args
            in
                let val (ty', ctx) = monoType ctx ty
                in
                    (* Check the table of function monomorphs. If this
                       name+type arg list combination doesn't exist yet, add
                       it *)
                    case getMonomorph ctx name tyargs' of
                        SOME id => let val gfcall = GenericFuncall (name, id, tyargs', args', ty')
                                   in
                                       (gfcall, ctx)
                                   end
                      | NONE => let val id = freshId ()
                                in
                                    let val ctx = addMonomorph ctx name tyargs' id
                                    in
                                        let val gfcall = GenericFuncall (name, id, tyargs', args', ty')
                                        in
                                            (gfcall, ctx)
                                        end
                                    end
                                end
                end
            end
        end
      | monomorphize ctx (TAST.MethodFuncall (name, tyargs, args, ty)) =
        raise Fail "monomorphize: method funcall not implemented yet"

    and monomorphizeList ctx exps =
        Util.foldThread (fn (exp, ctx) => monomorphize ctx exp)
                        exps
                        ctx

    fun monomorphizeTop' ctx (TAST.Defun (name, params, rt, _, body)) =
        monomorphizeDefun ctx name params rt body
      | monomorphizeTop' ctx (TAST.Defgeneric (name, typarams, params, rt, docstring, body)) =
        (ToplevelProgn [], ctx)
      | monomorphizeTop' ctx (TAST.Defclass _) =
        (ToplevelProgn [], ctx)
      | monomorphizeTop' _ (TAST.Definstance (name, arg, docstring, methods)) =
        raise Fail "Not implemented yet"
      | monomorphizeTop' _ (TAST.Deftype (name, params, _, ty)) =
        raise Fail "Not implemented yet"
      | monomorphizeTop' _ (TAST.Defdisjunction (name, params, _, variants)) =
        raise Fail "Not implemented yet"
      | monomorphizeTop' ctx (TAST.Deftemplate _) =
        (ToplevelProgn [], ctx)
      | monomorphizeTop' ctx (TAST.DefineSymbolMacro _) =
        (ToplevelProgn [], ctx)
      | monomorphizeTop' ctx (TAST.Defmodule _) =
        (ToplevelProgn [], ctx)
      | monomorphizeTop' ctx (TAST.InModule _) =
        (ToplevelProgn [], ctx)
      | monomorphizeTop' ctx (TAST.Defcfun _) =
        (ToplevelProgn [], ctx)

    and monomorphizeDefun ctx name params rt body =
        let fun mapParam (TAST.Param (var, ty)) =
                Param (var, forciblyMonomorphize ctx ty)
        in
            let val (body', ctx) = monomorphize ctx body
            in
                let val node = Defun (name,
                                      map mapParam params,
                                      forciblyMonomorphize ctx rt,
                                      body')
                in
                    (node, ctx)
                end
            end
        end

    and monomorphizeTop fenv fdefenv ctx node =
        let val (node, ctx') = monomorphizeTop' ctx node
        in
            (* When we monomorphize a toplevel node, we have two contents: the
               starting context `ctx` and the resulting context `ctx'`. To
               create monomorph placeholders, we take a diff of both contexts,
               and create placeholders for concrete function definitions and
               type definitions that are implied by the monomorphs in the ctx'
               but are not present in the ctx. *)
            let val newFuncs = newFuncMonomorphs ctx ctx'
                and newTypes = newTypeMonomorphs ctx ctx'
            in
                let val defuns = map (fn (name, args, id) =>
                                         expandDefgeneric fenv fdefenv name args id)
                                     newFuncs
                    and deftypes = map (fn (name, _, ty, id) =>
                                           expandDeftype name ty id)
                                       newTypes
                in
                    (ToplevelProgn (defuns @ deftypes @ [node]),
                     ctx')
                end
            end
        end

    and expandDefgeneric env name args id =
        raise Fail "Not implemented"

    and expandDeftype name ty id =
        DeftypeMonomorph (name, ty, id)
end
