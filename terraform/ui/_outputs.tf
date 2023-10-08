output "bucket_domain_name" {
  value = aws_s3_bucket.main.bucket_domain_name
}

output "cloudfront_bucket_access_identity" {
  value = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
}
