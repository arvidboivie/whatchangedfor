module "lambda_function" {
  source  = "terraform-aws-modules/lambda/aws"
  version = "6.4.0"

  function_name = var.name
  handler       = var.handler
  runtime       = "nodejs18.x"
  timeout       = 120
  memory_size   = 256

  create_package         = false
  local_existing_package = "${var.filename}.zip"

  layers = [
    module.lambda_layer_dependencies.lambda_layer_arn
  ]

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

module "lambda_layer_dependencies" {
  source = "terraform-aws-modules/lambda/aws"

  create_layer = true

  layer_name          = "staging-whatchangedfor-dependencies"
  description         = "Node dependencies for whatchangedfor (staging)"
  compatible_runtimes = ["nodejs18.x"]

  source_path = "${var.filename}/../nodejs"

  store_on_s3 = true
  s3_bucket   = aws_s3_bucket.dependency_bucket.bucket
}

resource "aws_s3_bucket" "dependency_bucket" {
  bucket = "staging-whatchangedfor-dependency-bucket"

  tags = {
    project     = "whatchangedfor"
    environment = "staging"
  }
}
