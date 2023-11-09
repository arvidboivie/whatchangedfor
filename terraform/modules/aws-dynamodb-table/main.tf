resource "aws_dynamodb_table" "dynamodb_table" {
  name         = var.name
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "version"
    type = "S"
  }

  hash_key  = "id"
  range_key = "version"
}
