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

structure MIR :> MIR = struct
    type name = string

    datatype ty = Bool
                | UInt8
                | SInt8
                | UInt16
                | SInt16
                | UInt32
                | SInt32
                | UInt64
                | SInt64
                | SingleFloat
                | DoubleFloat
                | NamedType of name
                | Pointer of ty
                | Tuple of ty list
                | TypeCons of name * ty list
                | TypeVariable of name

    datatype exp_ast = BoolConstant of bool
                     | IntConstant of string
                     | FloatConstant of string
                     | StringConstant of CST.escaped_string
                     | NullConstant
                     | Variable of string
                     | Cast of ty * exp_ast
                     | Load of exp_ast
                     | AddressOf of exp_ast
                     | SizeOf of ty
                     | TupleCreate of exp_ast list
                     | TupleProj of exp_ast * int
                     | Funcall of string * ty list * exp_ast list

    datatype block_ast = Progn of block_ast list
                       | Declare of string * ty
                       | Assign of exp_ast * exp_ast
                       | Store of exp_ast * exp_ast
                       | Cond of exp_ast * block_ast * block_ast

    datatype top_ast = Defun of name * typaram list * param list * ty * block_ast * exp_ast
                     | ToplevelProgn of top_ast list
         and typaram = TypeParam of name
         and param = Param of name * ty
         and slot = Slot of name * ty

    (* Fresh variables *)

    val count = ref 0

    fun freshVar () =
        let
        in
            count := !count + 1;
            "auto_" ^ (Int.toString (!count))
        end

    (* Transformations *)

    local
        open Type
    in
        fun transformIntType Unsigned Int8 = UInt8
          | transformIntType Signed   Int8 = SInt8
          | transformIntType Unsigned Int16 = UInt16
          | transformIntType Signed   Int16 = SInt16
          | transformIntType Unsigned Int32 = UInt32
          | transformIntType Signed   Int32 = SInt32
          | transformIntType Unsigned Int64 = UInt64
          | transformIntType Signed   Int64 = SInt64
    end

    fun transformType Type.Unit = Bool
      | transformType Type.Bool = Bool
      | transformType (Type.Integer (s, w)) = transformIntType s w
      | transformType (Type.Float Type.Single) = SingleFloat
      | transformType (Type.Float Type.Double) = DoubleFloat
      | transformType (Type.Tuple tys) = Tuple (map transformType tys)
      | transformType (Type.Pointer ty) = Pointer (transformType ty)
      | transformType (Type.Disjunction (name, args, _)) = TypeCons (HIR.escapeSymbol name,
                                                                     map transformType args)
      | transformType (Type.TypeVariable name) = TypeVariable (HIR.escapeSymbol name)

    fun transformExp (HIR.BoolConstant b) =
        (Progn [], BoolConstant b)
      | transformExp (HIR.IntConstant i) =
        (Progn [], IntConstant i)
      | transformExp (HIR.FloatConstant f) =
        (Progn [], FloatConstant f)
      | transformExp (HIR.StringConstant s) =
        (Progn [], StringConstant s)
      | transformExp (HIR.Variable name) =
        (Progn [], Variable name)
      | transformExp (HIR.Cond (test, cons, alt, ty)) =
        let val ty' = transformType ty
            and result = freshVar ()
        in
            let val (testBlock, testExp) = transformExp test
                and (consBlock, consExp) = transformExp cons
                and (altBlock, altExp) = transformExp alt
            in
                (Progn [testBlock,
                        Declare (result, ty'),
                        Cond (testExp,
                              Progn [
                                  consBlock,
                                  Assign (Variable result, consExp)
                              ],
                              Progn [
                                  altBlock,
                                  Assign (Variable result, altExp)
                             ])
                       ],
                 Variable result)
            end
        end
      | transformExp (HIR.TupleCreate exps) =
        let val exps' = map transformExp exps
        in
            let fun pairBlocks (b, _) = b
                and pairExp (_, e) = e
            in
                (Progn (map pairBlocks exps'),
                 TupleCreate (map pairExp exps'))
            end
        end
      | transformExp (HIR.TupleProj (tup, idx)) =
        let val (tupBlock, tupExp) = transformExp tup
        in
            (tupBlock, TupleProj (tupExp, idx))
        end
      | transformExp (HIR.Allocate exp) =
        raise Fail "allocate not implemented"
      | transformExp (HIR.Load ptr) =
        let val (ptrBlock, ptrExp) = transformExp ptr
        in
            (ptrBlock, Load ptrExp)
        end
      | transformExp (HIR.Store (ptr, value)) =
        let val (ptrBlock, ptrExp) = transformExp ptr
            and (valBlock, valExp) = transformExp value
        in
            (Progn [ptrBlock, valBlock, Store (ptrExp, valExp)],
             ptrExp)
        end
      | transformExp (HIR.Cast (ty, exp)) =
        let val (expBlock, exp') = transformExp exp
        in
            (expBlock, Cast (transformType ty, exp'))
        end
      | transformExp _ =
        raise Fail "HIR->MIR not implemented"

    fun transformTop (HIR.Defun (name, params, ty, body)) =
        let fun mapParam (HIR.Param (name, ty)) =
                Param (name, transformType ty)
        in
            let val (bodyBlock, bodyExp) = transformExp body
            in
                Defun (name,
                       [],
                       map mapParam params,
                       transformType ty,
                       bodyBlock,
                       bodyExp)
            end
        end
      | transformTop _ =
        raise Fail "not implemented"
end
