resource "aws_dynamodb_table" "messages" {
  name         = "${var.service_name}-messages"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "Id"

  ttl {
    enabled        = true
    attribute_name = "ExpiresAt"
  }

  attribute {
    name = "Id"
    type = "S"
  }
}
