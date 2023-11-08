terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.14.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

module "aws_lambda_setup" {
  source       = "../../../terraform/modules/aws-lambda-function"
  filename     = "../../../dist/apps/parser"
  handler      = "main.parse"
  environment  = "staging"
  name         = "staging-whatchangedfor-parser"
  dynamo_table = "whatchangedfor-staging"
}
