module "lambda_function" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "6.4.0"

  function_name = var.name
  handler       = var.handler
  runtime       = "nodejs18.x"

  source_path = var.filename

  environment_variables = {
    DYNAMODB_TABLE = "whatchangedfor-staging"
  }

  attach_policy_statements = true
  policy_statements = {
    dynamodb = {
      effect = "Allow",
      actions = ["dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:Query",
      "dynamodb:UpdateItem"],
      resources = ["arn:aws:dynamodb:eu-central-1:*:table/${var.dynamo_table}"]
    },
  }
}

# resource "aws_lambda_function" "lambda_function" {
#   architectures    = ["x86_64"]
#   filename         = var.filename
#   function_name    = var.name
#   handler          = var.handler
#   kms_key_arn      = null
#   layers           = []
#   memory_size      = 256
#   package_type     = "Zip"
#   role             = var.role
#   runtime          = "nodejs18.x"
#   skip_destroy     = false
#   source_code_hash = "17QzafVqYitNX/Nxzo8lnqdNtz84lfgiEU1fTXtKQxU="
#   tags = {
#     STAGE = var.environment
#   }
#   tags_all = {
#     STAGE = var.environment
#   }
#   timeout = 120
#   environment {
#     variables = {
#       DYNAMODB_TABLE = "whatchangedfor-staging"
#     }
#   }
#   ephemeral_storage {
#     size = 512
#   }
#   tracing_config {
#     mode = "PassThrough"
#   }
# }
