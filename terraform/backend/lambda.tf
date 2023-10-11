resource "aws_lambda_function" "api" {
  function_name = "${var.service_name}-api"
  runtime       = "provided.al2"
  role          = aws_iam_role.api_lambda.arn

  # placeholder values only used for bootstrap
  filename    = data.archive_file.dummy_zip.output_path
  handler     = "bootstrap"
  memory_size = 1024

  lifecycle {
    ignore_changes = [
      filename,
      handler,
    ]
  }
}

data "archive_file" "dummy_zip" {
  type        = "zip"
  output_path = "${path.module}/dummy_lambda.zip"

  source_content_filename = "bootstrap"
  source_content          = "#"
}

resource "aws_iam_role" "api_lambda" {
  name               = "${var.service_name}-api"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json

  inline_policy {
    name   = "all"
    policy = data.aws_iam_policy_document.lambda_permissions.json
  }
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "lambda_permissions" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "${aws_cloudwatch_log_group.api.arn}:log-stream:*",
    ]
  }

  statement {
    actions = [
      "dynamodb:DeleteItem",
      "dynamodb:PutItem",
    ]
    resources = [
      aws_dynamodb_table.messages.arn,
    ]
  }
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${var.service_name}-api"
  retention_in_days = 180
}

resource "aws_lambda_permission" "api_lambda_gateway_invoke" {
  statement_id   = "ApiGatewayInvoke"
  function_name  = aws_lambda_function.api.function_name
  principal      = "apigateway.amazonaws.com"
  action         = "lambda:InvokeFunction"
  source_arn     = "${aws_apigatewayv2_api.api.execution_arn}/*"
  source_account = data.aws_caller_identity.current.account_id
}
