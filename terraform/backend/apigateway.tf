resource "aws_apigatewayv2_api" "api" {
  name          = "${var.service_name}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "api_default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = 1
    throttling_burst_limit = 10
  }
}

resource "aws_apigatewayv2_route" "api_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"

  target = "integrations/${aws_apigatewayv2_integration.api_lambda.id}"
}

resource "aws_apigatewayv2_integration" "api_lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  integration_method     = "POST"
  timeout_milliseconds   = 3000
  payload_format_version = "2.0"
}
