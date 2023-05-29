import { TmLanguage } from "./tmlanguage";

const include = (...refs: string[]) => refs.map((r) => ({ include: r }));

const language: TmLanguage = {
  name: "Austral",
  patterns: [
    {
      match: "\\.",
      name: "punctuation.delimiter.module.end.austral",
    },
    ...include(
      "#import",
      "#import_simple",
      "#module_body",
      "#module",
      "#context_block"
    ),
  ],
  repository: {
    keywords: {
      patterns: [
        {
          name: "keyword.control.$0.austral",
          match:
            "\\b(skip|import|if|then|else|case|when|whiledo|of|for|return|(else\\s+if))\\b",
        },
        {
          name: "keyword.control.end.$1.austral",
          match: "\\bend\\s+(if|case|while|for)\\b",
        },
        {
          name: "storage.type.$0.austral",
          match:
            "\\b(constant|let|generic|function|method|instance|record|union|type|typeclass)\\b",
        },
        {
          name: "keyword.other.module.interface.austral storage.type.module.interface.austral",
          match: "\\bmodule\\b",
        },
        {
          name: "keyword.other.module.body.austral storage.type.module.body.austral",
          match: "\\bmodule\\s+body\\b",
        },
        {
          name: "keyword.other.end.module.interface.austral storage.type.module.interface.austral",
          match: "\\bend\\s+module\\b",
        },
        {
          name: "keyword.other.end.module.body.austral storage.type.module.body.austral",
          match: "\\bend\\s+module\\s+body\\b",
        },
        {
          match: "\\bsizeof\\b",
          name: "keyword.operator.sizeof.austral keyword.other.sizeof.austral",
        },
        {
          match: "(\\@embed)",
          name: "keyword.operator.embed.austral keyword.other.embed.austral",
        },
        {
          name: "keyword.other.$0.austral",
          match: "\\b(pragma|is|end)\\b",
        },
        {
          name: "keyword.other.borrow.austral",
          match: "\\bborrow\\!?\\b",
        },
      ],
    },
    comment: {
      match: "\\s*(--).*",
      name: "comment.line.austral",
      captures: {
        "1": {
          name: "punctuation.definition.comment.austral",
        },
      },
    },
    context_import_symbol_list: {
      name: "meta.import.symbols.austral",
      patterns: [
        {
          include: "#comment",
        },
        {
          match: "\\bas\\b",
          name: "keyword.control.import.as.austral",
        },
        {
          name: "punctuation.separator.delimiter.comma.austal",
          match: ",",
        },
        {
          match: "\\b([a-zA-Z][a-zA-Z0-9_]*)\\b",
          name: "entity.name.import-symbol.austral",
        },
      ],
    },
    context_paramater_list: {
      comment: "paramater lists for pragmas and method/function calls",
      patterns: [
        {
          comment: "named paramater assignment",
          match: "\\b([a-zA-Z][a-zA-Z0-9_]*)\\s*(=>)",
          captures: {
            "1": {
              name: "variable.parameter.function-call.austral",
            },
            "2": {
              name: "keyword.operator.assignment.named-paramater.austral",
            },
          },
        },
        {
          include: "#context_expression",
        },
        {
          name: "punctuation.separator.delimiter.comma.austal",
          match: ",",
        },
      ],
    },
    context_expression: {
      name: "meta.expression.austral",
      patterns: [
        {
          include: "#comment",
        },
        {
          include: "#constants",
        },
        {
          include: "#operators",
        },
        {
          match: "(:)\\s*([a-zA-Z][a-zA-Z0-9_]*(?:\\[.*\\])?)",
          captures: {
            "1": {
              name: "keyword.operator.typecast.austral",
            },
            "2": {
              patterns: [
                {
                  include: "#typespec",
                },
              ],
            },
          },
        },
        {
          comment: "sub-expression",
          begin: "\\(",
          end: "\\)",
          beginCaptures: {
            "0": {
              name: "punctuation.section.expression.begin.bracket.round.austral",
            },
          },
          endCaptures: {
            "0": {
              name: "punctuation.section.expression.begin.bracket.round.austral",
            },
          },
          patterns: [
            {
              include: "#context_expression",
            },
          ],
        },
        {
          comment: "sizeof operator",
          begin: "\\b(sizeof)\\s*(\\()",
          end: "\\)",
          beginCaptures: {
            "1": {
              name: "keyword.operator.sizeof.austral",
            },
            "2": {
              name: "punctuation.section.arguments.begin.bracket.round.austral",
            },
          },
          endCaptures: {
            "0": {
              name: "punctuation.section.arguments.begin.bracket.round.austral",
            },
          },
          patterns: [
            {
              include: "#typespec",
            },
          ],
        },
        {
          include: "#function_call",
        },
        {
          match: "\\b([a-zA-Z][a-zA-Z0-9_]*)\\b",
          name: "variable.other.austral",
        },
        {
          include: "#path",
        },
      ],
    },
    context_type_parameter_list: {
      name: "meta.type-paramater-list.austral",
      patterns: [
        {
          include: "#region_assertion",
        },
        {
          match: "([a-zA-Z][a-zA-Z0-9_]*)",
          name: "entity.name.type.austral",
        },
        {
          include: "#comment",
        },
        {
          match: ",",
          name: "punctuation.comma.austral",
        },
        {
          match: "[\\(\\)]",
          name: "punctuation.brackets.round.austral",
        },
      ],
    },
    context_function_paramater_def: {
      name: "meta.function-decl.parameters.austral",
      patterns: [
        {
          include: "#comment",
        },
        {
          match: "([a-zA-Z][a-zA-Z0-9_]*)\\s*(:)",
          captures: {
            "1": {
              name: "variable.parameter.austral",
            },
            "2": {
              name: "punctuation.colon.austral",
            },
          },
        },
        {
          include: "#typespec",
        },
        {
          name: "punctuation.brackets.round.austral",
          match: "[\\(\\)]",
        },
      ],
    },
    context_binding_list: {
      name: "meta.bindings.austral",
      patterns: [
        {
          include: "#comment",
        },
        {
          match: "(:)\\s*([a-zA-Z][a-zA-Z0-9_]*(?:\\[(.*)\\])?)",
          captures: {
            "1": {
              name: "keyword.operator.type.annotation.austral",
            },
            "2": {
              name: "meta.binding-type.austral",
              patterns: [
                {
                  include: "#typespec",
                },
              ],
            },
          },
        },
        {
          match: "\\b[a-zA-Z][a-zA-Z0-9_]*\\b",
          name: "variable.other.binding.austral",
        },
        {
          match: "\\bas\\b",
          name: "keyword.operator.as.austral",
        },
      ],
    },
    context_slot_list: {
      patterns: [
        {
          include: "#comment",
        },
        {
          include: "#string_triple",
        },
        {
          match: ";",
          name: "punctuation.delimiter.slot.end.austral",
        },
        {
          include: "#slot",
        },
      ],
    },
    context_block: {
      patterns: [
        {
          match: ";",
          name: "punctuation.terminator.statement.austral",
        },
        {
          include: "#comment",
        },
        {
          include: "#let_simple",
        },
        {
          include: "#pragma",
        },
        {
          include: "#let_destructure",
        },
        {
          include: "#borrow_head",
        },
        {
          include: "#if_head",
        },
        {
          include: "#case_head",
        },
        {
          include: "#for_loop_head",
        },
        {
          include: "#while_loop_head",
        },
        {
          include: "#if_body",
        },
        {
          include: "#case_body",
        },
        {
          include: "#do_block",
        },
        {
          include: "#constant_decl",
        },
        {
          include: "#keywords",
        },
        {
          include: "#context_expression",
        },
        {
          include: "#assignment",
        },
      ],
    },
    universe_assertion: {
      comment:
        "colon followed by a universe, used for ascribing a universe to a type",
      match: "(:)\\s+(Free|Linear|Type|Region)",
      captures: {
        "1": {
          name: "punctuation.delimiter.region.colon.austral",
        },
        "2": {
          name: "entity.name.universe.austral entity.name.type.austral",
        },
      },
    },
    context_module_interface: {
      patterns: [
        {
          include: "#comment",
        },
        {
          include: "#string_triple",
        },
        {
          include: "#pragma",
        },
        {
          include: "#constant_decl",
        },
        {
          include: "#record_body",
        },
        {
          include: "#union_body",
        },
        {
          include: "#union_or_record_head",
        },
        {
          comment: "type declaration",
          name: "meta.type.austral",
          match:
            "(type)\\s+([a-zA-Z][a-zA-Z0-9_]*)\\s*(?:(\\[)(.*)(\\]))?\\s*(?:(:)\\s*(Free|Linear|Type|Region))?",
          captures: {
            "1": {
              name: "keyword.declaration.type.austral storage.type.austral",
            },
            "2": {
              name: "entity.name.type.austral",
            },
            "3": {
              name: "punctuation.brackets.square.austral",
            },
            "4": {
              patterns: [
                {
                  include: "#context_type_parameter_list",
                },
              ],
            },
            "5": {
              name: "punctuation.brackets.square.austral",
            },
            "6": {
              name: "punctuation.colon.austral",
            },
            "7": {
              name: "entity.name.universe.austral entity.name.type.austral",
            },
          },
        },
        {
          include: "#generic",
        },
        {
          include: "#function_head",
        },
        {
          include: "#typeclass_head",
        },
        {
          include: "#typeclass_body",
        },
        {
          include: "#instance_head",
        },
        {
          include: "#keywords",
        },
      ],
    },
    context_module_body: {
      patterns: [
        {
          include: "#instance_body",
        },
        {
          include: "#function_body",
        },
        {
          include: "#assignment",
        },
        {
          include: "#context_module_interface",
        },
      ],
    },
    import_simple: {
      comment: "initial highlighting on import without the symbol list",
      name: "meta.import.austral",
      match:
        "\\b(import)\\s+((?:[a-zA-Z][a-zA-Z0-9_]*)(?:\\.[a-zA-Z][a-zA-Z0-9_]*)*)",
      captures: {
        "1": {
          name: "keyword.control.import.austral",
        },
        "2": {
          name: "entity.name.module.austral",
        },
      },
    },
    import: {
      name: "meta.import.austral",
      begin:
        "\\b(import)\\s+((?:[a-zA-Z][a-zA-Z0-9_]*)(?:\\.[a-zA-Z][a-zA-Z0-9_]*)*)\\s*(\\()",
      end: "\\)",
      beginCaptures: {
        "1": {
          name: "keyword.control.import.austral",
        },
        "2": {
          name: "entity.name.module.austral",
        },
        "3": {
          name: "punctuation.section.imports.begin.bracket.round.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.section.imports.begin.bracket.round.austral",
        },
      },
      patterns: [
        {
          include: "#context_import_symbol_list",
        },
      ],
    },
    generic: {
      name: "meta.generic-decl.austral",
      begin: "(generic)\\s*(\\[)",
      end: "\\]",
      beginCaptures: {
        "1": {
          name: "keyword.other.generic.austral",
        },
        "2": {
          name: "punctuation.brackets.square.austral",
        },
      },
      patterns: [
        {
          include: "#context_type_parameter_list",
        },
      ],
    },
    constants: {
      patterns: [
        {
          include: "#float_constant",
        },
        {
          include: "#bool_constants",
        },
        {
          include: "#nil_constant",
        },
        {
          include: "#integer_constants",
        },
        {
          include: "#triple_string",
        },
        {
          include: "#string",
        },
      ],
    },
    assignment: {
      comment: "the := ...; part of an assignment statement",
      begin: ":=",
      end: ";",
      beginCaptures: {
        "0": {
          name: "keyword.operator.assign.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.semicolon.austral",
        },
      },
      patterns: [
        {
          include: "#context_expression",
        },
      ],
    },
    float_constant: {
      comment: "decimal float constant",
      match:
        "([+\\-])?[0-9][0-9']*\\.([0-9][0-9']*)?([eE][+\\-]?[0-9][0-9']*)?",
      name: "constant.numeric.decimal.float.austral",
    },
    bool_constants: {
      comment: "boolean constant",
      match: "\\b(true|false)\\b",
      name: "constant.language.bool.austral",
    },
    nil_constant: {
      comment: "nil constant",
      match: "\\bnil\\b",
      name: "constant.language.nil.austral",
    },
    integer_constants: {
      patterns: [
        {
          comment: "decimal integer constant",
          match: "([+\\-])?[0-9][0-9']*",
          captures: {
            "1": {
              name: "keyword.operator.sign.austral",
            },
          },
          name: "constant.numeric.decimal.austral",
        },
        {
          comment: "hexadecimal integer constant",
          match: "#x[0-9a-fA-F][0-9a-fA-F']*",
          name: "constant.numeric.hex.austral",
        },
        {
          comment: "octal integer constant",
          match: "#o[0-7][0-7']*",
          name: "constant.numeric.octal.austral",
        },
        {
          comment: "binary integer constant",
          match: "#b[0-1][0-1']*",
          name: "constant.numeric.bin.austral",
        },
        {
          comment: "char (Nat8) constant",
          name: "string.quoted.single.char.austral",
          begin: "'",
          end: "'",
          beginCaptures: {
            "0": {
              name: "punctuation.definition.char.austral",
            },
          },
          endCaptures: {
            "0": {
              name: "punctuation.definition.char.austral",
            },
          },
          patterns: [
            {
              include: "#escapes",
            },
            {
              match: ".{2,}(?=')",
              name: "invalid.illegal.char-literal.austral",
            },
            {
              comment: "Valid ASCII chars for char constants",
              match:
                "[a-zA-Z0-9\\ \\!\"#\\$%&'\\)\\(*+,\\-\\./:;<=>?@`~\\[\\]^_{}|]",
            },
            {
              match: ".*(?=')",
              name: "invalid.illegal.char-literal.austral",
            },
          ],
        },
      ],
    },
    path: {
      patterns: [
        {
          comment: "array access",
          name: "meta.access.array.austral",
          begin: "(?<=[\\)\\]a-zA-Z0-9_])(\\[)",
          end: "\\]",
          beginCaptures: {
            "1": {
              name: "punctuation.definition.begin.bracket.square.c",
            },
          },
          endCaptures: {
            "0": {
              name: "punctuation.definition.end.bracket.square.c",
            },
          },
          patterns: [
            {
              include: "#context_expression",
            },
          ],
        },
        {
          comment: "slot access (including pointer)",
          name: "meta.access.slot.austral",
          match: "(?<=[\\)\\]a-zA-Z0-9_])(?:(\\.)|(->))([a-zA-Z][a-zA-Z0-9_]*)",
          captures: {
            "1": {
              name: "punctuation.separator.slot-access.austral",
            },
            "2": {
              name: "punctuation.separator.pointer-slot-access.austral",
            },
            "3": {
              name: "variable.other.member.austral",
            },
          },
        },
      ],
    },
    function_call: {
      name: "meta.function-call.austral",
      begin: "(?:(@embed)|([a-zA-Z][a-zA-Z0-9_]*))\\s*(\\()",
      end: "\\)",
      beginCaptures: {
        "1": {
          name: "keyword.operator.embed.austral keyword.other.embed.austral",
        },
        "2": {
          name: "entity.name.function.austral",
        },
        "3": {
          name: "punctuation.section.arguments.begin.bracket.round.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.section.arguments.begin.bracket.round.austral",
        },
      },
      patterns: [
        {
          include: "#context_paramater_list",
        },
      ],
    },
    pragma_params: {
      name: "meta.pragma.austral",
      begin: "(pragma)\\s+([a-zA-Z][a-zA-Z0-9_]*)\\s*(\\()",
      end: "\\)",
      beginCaptures: {
        "1": {
          name: "keyword.other.pragma.austral",
        },
        "2": {
          name: "entity.name.pragma.austral",
        },
        "3": {
          name: "punctuation.section.arguments.begin.bracket.round.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.section.arguments.begin.bracket.round.austral",
        },
      },
      patterns: [
        {
          name: "meta.pragma.arguments.austral",
          include: "#context_paramater_list",
        },
      ],
    },
    pragma_simple: {
      match: "(pragma)\\s+([a-zA-Z][a-zA-Z0-9_]*)",
      captures: {
        "1": {
          name: "keyword.other.pragma.austral",
        },
        "2": {
          name: "entity.name.pragma.austral",
        },
      },
    },
    pragma: {
      patterns: [
        {
          include: "#pragma_simple",
        },
        {
          include: "#pragma_params",
        },
      ],
    },
    operators: {
      patterns: [
        {
          comment: "logical operators",
          match: "\\b(not|and|or)\\b",
          name: "keyword.operator.logical.$0.austral",
        },
        {
          comment: "comparison operators",
          match: "(=|/=|<=|<|>=|>)",
          name: "keyword.operator.comparison.austral",
        },
        {
          comment: "borrow operators",
          match: "(&|&!)",
          name: "keyword.operator.borrow.austral",
        },
        {
          comment: "arithmetic operators",
          match: "(\\+|-|/|\\*)",
          name: "keyword.operator.arithmetic.austral",
        },
      ],
    },
    typespec: {
      name: "meta.typespec.austral",
      patterns: [
        {
          comment: "paramterized types",
          begin: "([a-zA-Z][A-Za-z0-9_]*)(\\[)",
          beginCaptures: {
            "1": {
              name: "entity.name.type.austral",
            },
            "2": {
              name: "punctuation.brackets.square.austral",
            },
          },
          end: "]",
          endCaptures: {
            "0": {
              name: "punctuation.brackets.square.austral",
            },
          },
          patterns: [
            {
              include: "#typespec",
            },
            {
              include: "#comment",
            },
            {
              match: ",",
              name: "punctuation.comma.austral",
            },
          ],
        },
        {
          comment: "reference types",
          begin: "(&!)\\s*(\\[)",
          beginCaptures: {
            "1": {
              name: "operator.punctuation.borrow-write.austral",
            },
            "2": {
              name: "punctuation.brackets.square.austral",
            },
          },
          end: "]",
          endCaptures: {
            "0": {
              name: "punctuation.brackets.angle.austral",
            },
          },
          patterns: [
            {
              include: "#context_type_parameter_list",
            },
          ],
        },
        {
          comment: "primitive types",
          name: "entity.name.type.primitive.austral",
          match: "\\b(Bool|((Nat|Int)(8|16|32|64))|Index)\\b",
        },
        {
          name: "entity.name.type.austral",
          match: "\\b[a-zA-Z][A-Za-z0-9_]*\\b",
        },
      ],
    },
    slot: {
      comment: "member values used in records and unions",
      name: "meta.slot.austral",
      match:
        "([a-zA-Z][a-zA-Z0-9_]*)\\s*(?:(:)\\s*([a-zA-Z][a-zA-Z0-9_]*(?:\\[(.*)\\])?))?",
      captures: {
        "1": {
          name: "entity.name.member.austral",
        },
        "2": {
          name: "keyword.operator.type.annotation.austral",
        },
        "3": {
          name: "meta.slot.type.austral",
          patterns: [
            {
              include: "#typespec",
            },
          ],
        },
      },
    },
    constant_decl: {
      comment: "constant declaration",
      name: "meta.constant.austral",
      match:
        "(constant)\\s+([a-zA-Z][a-zA-Z0-9_]*)\\s*(:)\\s*([a-zA-Z][a-zA-Z0-9_]*(?:\\[(.*)\\])?)",
      captures: {
        "1": {
          name: "keyword.other.austral storage.type.constant.austral",
        },
        "2": {
          name: "entity.name.constant.austral",
        },
        "3": {
          name: "punctuation.colon.austral",
        },
        "4": {
          patterns: [
            {
              include: "#typespec",
            },
          ],
        },
      },
    },
    union_or_record_head: {
      comment: "top of union/record declaration",
      name: "meta.union.austral",
      begin: "(union|record)\\s+([a-zA-Z][a-zA-Z0-9_]*)",
      end: "(?=\\bis\\b)",
      beginCaptures: {
        "1": {
          name: "keyword.declaration.$1.austral storage.type.$1.austral",
        },
        "2": {
          name: "entity.name.type.austral",
        },
      },
      patterns: [
        {
          include: "#comment",
        },
        {
          comment: "type parameter list",
          begin: "\\[",
          end: "\\]",
          beginCaptures: {
            "0": {
              name: "punctuation.section.type-parameters.begin.brackets.square.austral",
            },
          },
          endCaptures: {
            "0": {
              name: "punctuation.section.type-parameters.end.brackets.square.austral",
            },
          },
          patterns: [
            {
              include: "#context_type_parameter_list",
            },
          ],
        },
        {
          include: "#universe_assertion",
        },
      ],
    },
    record_body: {
      name: "meta.record.body.austral",
      begin: "(?<=(record).+)(is)",
      end: "\\bend\\b",
      beginCaptures: {
        "0": {
          name: "punctuation.definition.record.body.begin.austral keyword.other.is.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.definition.record.body.end.austral keyword.other.end.austral",
        },
      },
      patterns: [
        {
          include: "#context_slot_list",
        },
      ],
    },
    union_body: {
      name: "meta.record.union.austral",
      begin: "(?<=(union).+)(is)",
      end: "\\bend\\b",
      beginCaptures: {
        "0": {
          name: "punctuation.definition.union.body.begin.austral keyword.other.is.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.definition.union.body.end.austral keyword.other.end.austral",
        },
      },
      patterns: [
        {
          include: "#string_triple",
        },
        {
          include: "#comment",
        },
        {
          match: ";",
          name: "punctuation.delimiter.union.case.end.semicolon.austral",
        },
        {
          match: "\\b(case)(?:\\s+([a-zA-Z][a-zA-Z0-9_]*))?",
          captures: {
            "1": {
              name: "keyword.declaration.case.austral storage.type.case.austral",
            },
            "2": {
              name: "entity.name.type.austral",
            },
          },
        },
        {
          begin: "is",
          end: "(?=\\b(case|end)\\b)",
          beginCaptures: {
            "0": {
              name: "punctuation.definition.case.body.begin.austral keyword.other.end.austral",
            },
          },
          patterns: [
            {
              include: "#context_slot_list",
            },
          ],
        },
      ],
    },
    function_head: {
      name: "meta.$1-decl.austral",
      match:
        "(function|method)\\s+([a-zA-Z][a-zA-Z0-9_]*)\\s*(?:(\\()(.*)(\\)))?\\s*(?:(:)\\s*([a-zA-Z][a-zA-Z0-9_]*(?:\\[(.*)\\])?))?",
      captures: {
        "1": {
          name: "storage.type.function.austral",
        },
        "2": {
          name: "entity.name.function.method.austral",
        },
        "3": {
          name: "punctuation.section.parameters.begin.bracket.round.austral",
        },
        "4": {
          patterns: [
            {
              include: "#context_function_paramater_def",
            },
          ],
        },
        "5": {
          name: "punctuation.section.parameters.end.bracket.round.austral",
        },
        "6": {
          name: "punctuation.definition.function.return-type.austral",
        },
        "7": {
          name: "meta.return-type.austral",
          patterns: [
            {
              include: "#typespec",
            },
          ],
        },
      },
    },
    for_loop_head: {
      name: "meta.loop.for.austral",
      begin: "\\bfor\\b",
      end: "(?=\\bdo\\b)",
      beginCaptures: {
        "0": {
          name: "keyword.control.for.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "keyword.control.do.austral",
        },
      },
      patterns: [
        {
          match: "\\b(from|to)\\b",
          name: "keyword.control.$0.austral",
        },
        {
          include: "#context_expression",
        },
      ],
    },
    while_loop_head: {
      name: "meta.loop.while.austral",
      begin: "\\bwhile\\b",
      end: "(?=\\bdo\\b)",
      beginCaptures: {
        "0": {
          name: "keyword.control.while.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "keyword.control.do.austral",
        },
      },
      patterns: [
        {
          include: "#context_expression",
        },
      ],
    },
    do_block: {
      name: "meta.block.do.austral",
      begin: "\\bdo\\b",
      end: "\\bend(?:\\s+(for|while))?\\b",
      beginCaptures: {
        "0": {
          name: "punctuation.definition.block.begin.austral keyword.control.$0.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.definition.block.end.austral keyword.control.$0.austral",
        },
      },
      patterns: [
        {
          include: "#context_block",
        },
      ],
    },
    case_head: {
      name: "meta.case.austral",
      begin: "\\bcase\\b",
      end: "(?=\\bof\\b)",
      beginCaptures: {
        "0": {
          name: "keyword.control.$0.austral",
        },
      },
      patterns: [
        {
          include: "#context_expression",
        },
      ],
    },
    when_head: {
      name: "meta.case.when.austral",
      begin: "\\bwhen\\b",
      end: "\\bdo\\b",
      beginCaptures: {
        "0": {
          name: "keyword.control.$0.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.definition.block.begin.austral keyword.control.$0.austral",
        },
      },
      patterns: [
        {
          match: "\\b[a-zA-Z][a-zA-Z0-9_]*\\b",
          name: "entity.name.type.austral",
        },
        {
          begin: "\\(",
          end: "\\)",
          beginCaptures: {
            "0": {
              name: "punctuation.definition.binding-pattern.begin.austral",
            },
          },
          endCaptures: {
            "0": {
              name: "punctuation.definition.binding-pattern.end.austral",
            },
          },
          patterns: [
            {
              include: "#context_binding_list",
            },
          ],
        },
      ],
    },
    borrow_head: {
      name: "meta.borrow.austral",
      match: "(borrow\\!?)(.*)(?=do)",
      captures: {
        "1": {
          name: "keyword.other.borrow.austral",
        },
        "2": {
          patterns: [
            {
              include: "#comment",
            },
            {
              match: "(?=in)\\s+([a-zA-Z][a-z0-9_]*)",
              name: "entity.name.type.region.austral",
            },
            {
              match: "\\b(as|in)\\b",
              name: "keyword.other.$0.austral",
            },
            {
              match: "[a-zA-Z][a-zA-Z0-9_]*",
              name: "variable.name.austral",
            },
          ],
        },
      },
    },
    case_body: {
      name: "meta.body.case.austral",
      begin: "\\bof\\b",
      end: "\\bend\\s+(case)\\b",
      beginCaptures: {
        "0": {
          name: "punctuation.definition.block.begin.austral keyword.control.$0.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.definition.block.end.austral keyword.control.end.$1.austral",
        },
      },
      patterns: [
        {
          include: "#when_head",
        },
        {
          include: "#context_block",
        },
      ],
    },
    if_head: {
      comment: "head of an (else) if statement",
      name: "meta.if.austral",
      begin: "\\b(else\\s+)?if\\b",
      end: "(?=\\bthen\\b)",
      beginCaptures: {
        "0": {
          name: "keyword.control.$0.austral",
        },
      },
      patterns: [
        {
          include: "#context_expression",
        },
      ],
    },
    if_body: {
      name: "meta.if.body.austral",
      comment: "the body of an if/else statement",
      begin: "\\b(then|else)\\b",
      end: "\\b(?:(?=(else))|(end\\s+if))\\b",
      beginCaptures: {
        "0": {
          name: "keyword.control.$0.austral",
        },
      },
      endCaptures: {
        "1": {
          name: "keyword.control.else.austral",
        },
        "2": {
          name: "keyword.control.end.if.austral",
        },
      },
      patterns: [
        {
          include: "#context_block",
        },
      ],
    },
    function_body: {
      name: "meta.function.austral",
      begin: "(?<=(function|method).+)(is)",
      end: "\\b(end)\\b",
      beginCaptures: {
        "0": {
          name: "punctuation.definition.block.begin.austral keyword.other.is.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.definition.block.end.austral keyword.other.end.austral",
        },
      },
      patterns: [
        {
          include: "#context_block",
        },
      ],
    },
    let_destructure: {
      name: "meta.let.destructure.austral",
      begin: "(let)\\s+(\\{)",
      end: "\\}",
      beginCaptures: {
        "1": {
          name: "storage.type.variable.austal",
        },
        "2": {
          name: "punctuation.definition.binding-pattern.begin.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.definition.binding-pattern.end.austral",
        },
      },
      patterns: [
        {
          include: "#context_binding_list",
        },
      ],
    },
    let_simple: {
      name: "meta.let.destructure.austral",
      match: "(let)\\s+([a-zA-Z][a-zA-Z0-9_]*)",
      captures: {
        "1": {
          name: "storage.type.variable.austal",
        },
        "2": {
          name: "variable.other.let.austral",
        },
      },
    },
    instance_head: {
      name: "meta.instance.austral",
      match: "\\b(instance)\\s+([a-zA-Z][a-zA-Z0-9_]*)\\s*(\\()(.*)(\\))",
      captures: {
        "1": {
          name: "storage.type.instance.austral",
        },
        "2": {
          name: "entity.name.type.austral",
        },
        "3": {
          name: "punctuation.brackets.round.austral",
        },
        "4": {
          patterns: [
            {
              include: "#typespec",
            },
          ],
        },
        "5": {
          name: "punctuation.brackets.round.austral",
        },
      },
    },
    instance_body: {
      name: "meta.instance.austral",
      begin: "(?<=instance.+)(is)",
      end: "\\b(end)\\b",
      beginCaptures: {
        "0": {
          name: "punctuation.definition.instance.begin.austral keyword.other.is.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "punctuation.definition.instance.end.austral keyword.other.end.austral",
        },
      },
      patterns: [
        {
          include: "#string_triple",
        },
        {
          include: "#comment",
        },
        {
          match: "\\bfunction\\b",
          name: "invalid.illegal.function-in-instance.austral",
        },
        {
          include: "#generic",
        },
        {
          include: "#function_head",
        },
        {
          include: "#function_body",
        },
      ],
    },
    typeclass_head: {
      comment: "top of typeclass declaration",
      name: "meta.typeclass.austral",
      begin: "(typeclass)\\s+([a-zA-Z][a-zA-Z0-9_]*)",
      end: "(?=\\bis\\b)",
      beginCaptures: {
        "1": {
          name: "keyword.declaration.typeclass.austral storage.type.typeclass.austral",
        },
        "2": {
          name: "entity.name.type.austral",
        },
      },
      patterns: [
        {
          include: "#comment",
        },
        {
          begin: "\\(",
          end: "\\)",
          beginCaptures: {
            "0": {
              name: "punctuation.section.type-parameters.begin.brackets.round.austral",
            },
          },
          endCaptures: {
            "0": {
              name: "punctuation.section.type-parameters.end.brackets.round.austral",
            },
          },
          patterns: [
            {
              include: "#context_type_parameter_list",
            },
          ],
        },
      ],
    },
    typeclass_body: {
      comment: "typeclass declaration",
      name: "meta.typeclass.body.austral",
      begin: "(?<=typeclass.+)(is\\b)",
      end: "\\bend\\b",
      beginCaptures: {
        "1": {
          name: "storage.type.typeclass.austral keyword.other.is.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "keyword.other.end.typeclass.austral storage.type.typeclass.austral",
        },
      },
      patterns: [
        {
          include: "#string_triple",
        },
        {
          include: "#comment",
        },
        {
          match: "\\bfunction\\b",
          name: "invalid.illegal.function-in-typeclass.austral",
        },
        {
          include: "#generic",
        },
        {
          include: "#function_head",
        },
      ],
    },
    module: {
      patterns: [
        {
          comment: "module interface",
          name: "meta.module.interface.austral",
          begin:
            "(module)\\s+([a-zA-Z][a-zA-Z0-9_]*(?:\\.[a-zA-Z][a-zA-Z0-9_]*)*)\\s+(is)",
          end: "\\bend\\s+module\\b",
          beginCaptures: {
            "1": {
              name: "storage.type.module.austral",
            },
            "2": {
              name: "entity.name.module.austral",
            },
            "3": {
              name: "storage.type.module.austral keyword.other.is.austral",
            },
          },
          endCaptures: {
            "0": {
              name: "keyword.other.end.module.interface.austral storage.type.module.interface.austral",
            },
          },
          patterns: [
            {
              include: "#context_module_interface",
            },
          ],
        },
      ],
    },
    module_body: {
      comment: "module body",
      name: "meta.module.body.austral",
      begin:
        "(module\\s+body)\\s+([a-zA-Z][a-zA-Z0-9_]*(?:\\.[a-zA-Z][a-zA-Z0-9_]*)*)\\s+(is)",
      end: "\\bend\\s+module\\s+body\\b",
      beginCaptures: {
        "1": {
          name: "storage.type.module.austral",
        },
        "2": {
          name: "entity.name.module.austral",
        },
        "3": {
          name: "storage.type.module.austral keyword.other.is.austral",
        },
      },
      endCaptures: {
        "0": {
          name: "keyword.other.end.module.body.austral storage.type.module.body.austral",
        },
      },
      patterns: [
        {
          include: "#context_module_body",
        },
      ],
    },
    escapes: {
      comment: "string escape characters",
      name: "meta.string.escape.austral",
      patterns: [
        {
          name: "constant.character.escape.austral",
          match: "\\\\(n|r|t|\\\\| |')",
        },
        {
          comment: "mark unmatched escapes as illegal",
          name: "invalid.illegal.escape-sequence.austral",
          match: "\\\\.",
        },
      ],
    },
    string: {
      name: "string.quoted.double.austral",
      begin: '"',
      end: '"',
      patterns: [
        {
          name: "constant.character.escape.austral",
          match: '\\\\"',
        },
        {
          include: "#escapes",
        },
      ],
    },
    string_triple: {
      name: "string.quoted.triple.austral",
      begin: '"""',
      end: '"""',
      patterns: [
        {
          name: "constant.character.escape.austral",
          match: '\\\\"""',
        },
        {
          include: "#escapes",
        },
      ],
    },
  },
  scopeName: "source.austral",
};

export default language;
