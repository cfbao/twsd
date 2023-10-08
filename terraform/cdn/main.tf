resource "aws_cloudfront_distribution" "main" {
  comment = var.service_name
  aliases = [
    var.domain_name,
  ]

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "api"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_disabled.id
  }

  default_cache_behavior {
    target_origin_id       = "ui"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  origin {
    origin_id   = "api"
    domain_name = split("://", var.api_gateway_url)[1]

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    origin_id   = "ui"
    domain_name = var.ui.bucket_domain_name

    s3_origin_config {
      origin_access_identity = var.ui.bucket_access_identity
    }
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.main.arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
    cloudfront_default_certificate = false
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  depends_on = [
    aws_acm_certificate_validation.main,
  ]
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}
