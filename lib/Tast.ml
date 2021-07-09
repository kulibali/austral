open StringSet
open Identifier
open Common
open Type
open Region
open Semantic

type typed_module = TypedModule of module_name * typed_decl list

and typed_decl =
  | TConstant of vis * identifier * ty * texpr * docstring
  | TTypeAlias of type_vis * identifier * type_parameter list * universe * ty * docstring
  | TRecord of type_vis * identifier * type_parameter list * universe * typed_slot list * docstring
  | TUnion of type_vis * identifier * type_parameter list * universe * typed_case list * docstring
  | TFunction of vis * identifier * type_parameter list * value_parameter list * ty * tstmt * docstring
  | TForeignFunction of vis * identifier * value_parameter list * ty * string * docstring
  | TTypeClass of vis * identifier * type_parameter * typed_method_decl list * docstring
  | TInstance of vis * identifier * type_parameter list * ty * typed_method_def list * docstring

and typed_method_decl =
  TypedMethodDecl of identifier * value_parameter list * ty

and typed_method_def =
  TypedMethodDef of identifier * value_parameter list * ty * tstmt

and tstmt =
  | TSkip
  | TLet of identifier * ty * texpr * tstmt
  | TAssign of identifier * texpr
  | TIf of texpr * tstmt * tstmt
  | TCase of texpr * typed_when list
  | TWhile of texpr * tstmt
  | TFor of identifier * texpr * texpr * tstmt
  | TBlock of tstmt * tstmt
  | TDiscarding of texpr
  | TReturn of texpr

and texpr =
  | TNilConstant
  | TBoolConstant of bool
  | TIntConstant of string
  | TFloatConstant of string
  | TStringConstant of string
  | TVariable of identifier * ty
  | TArithmetic of arithmetic_operator * texpr * texpr
  | TFuncall of qident * texpr list * ty
  | TMethodCall of qident * semantic_instance * texpr list * ty
  | TCast of texpr * ty
  | TComparison of comparison_operator * texpr * texpr
  | TConjunction of texpr * texpr
  | TDisjunction of texpr * texpr
  | TNegation of texpr
  | TIfExpression of texpr * texpr * texpr
  | TRecordConstructor of ty * (identifier * texpr) list
  | TUnionConstructor of ty * identifier * (identifier * texpr) list

and typed_when =
  TypedWhen of identifier * value_parameter list * tstmt

type typed_arglist =
  | TPositionalArglist of texpr list
  | TNamedArglist of (identifier * texpr) list

let arglist_size = function
  | (TPositionalArglist l) -> List.length l
  | (TNamedArglist l) -> List.length l

let rec arglist_to_positional (args, names) =
  assert ((arglist_size args) = (List.length names));
  assert (names_match args names);
  match args with
  | (TPositionalArglist l) -> l
  | (TNamedArglist l) -> reorder_arglist l names

and names_match arglist names =
  match arglist with
  | (TPositionalArglist _) -> true
  | (TNamedArglist l) -> names_match_inner (List.map (fun (n, _) -> ident_string n) l) (List.map ident_string names)

and names_match_inner a b =
  StringSet.equal (StringSet.of_list a) (StringSet.of_list b)

and reorder_arglist l names =
  List.map (fun n -> find_arg_with_name l n) names

and find_arg_with_name l name =
  let (_, value) = List.find (fun (n, _) -> name = n) l in
  value

let rec get_type = function
  | TNilConstant ->
     Unit
  | TBoolConstant _ ->
     Boolean
  | TIntConstant _ ->
     Integer (Signed, Width32)
  | TFloatConstant _ ->
     DoubleFloat
  | TStringConstant _ ->
     Array (Integer (Unsigned, Width8), static_region)
  | TVariable (_, ty) ->
     ty
  | TArithmetic (_, lhs, _) ->
     get_type lhs
  | TFuncall (_, _, ty) ->
     ty
  | TMethodCall (_, _, _, ty) ->
     ty
  | TCast (_, ty) ->
     ty
  | TComparison _ ->
     Boolean
  | TConjunction _ ->
     Boolean
  | TDisjunction _ ->
     Boolean
  | TNegation _ ->
     Boolean
  | TIfExpression (_, t, _) ->
     get_type t
  | TRecordConstructor (ty, _) ->
     ty
  | TUnionConstructor (ty, _, _) ->
     ty
