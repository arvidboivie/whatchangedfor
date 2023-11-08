variable "name" {
  type        = string
  description = "Name of the lambda function"
}

variable "filename" {
  type        = string
  description = "Filename of the zipped deployment bundle"
}

variable "dynamo_table" {
  type        = string
  description = "Name of the dynamo table you want the lambda to use"
}

variable "handler" {
  type        = string
  description = "Name and path of the lambda handler function"
}

variable "environment" {
  description = "The environment name"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Invalid environment: ${var.environment}"
  }
}
