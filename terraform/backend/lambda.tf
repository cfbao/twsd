variable "service_name" {
  type = string
}

resource "aws_lambda_function" "api" {
  function_name = "${var.service_name}-api"
  runtime       = "provided.al2"
  role          = aws_iam_role.api_lambda.arn

  # placeholder values only used for bootstrap
  filename = data.archive_file.dummy_zip.output_path
  handler  = "bootstrap"

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
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${var.service_name}-api"
  retention_in_days = 180
}
