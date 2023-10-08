variable "service_name" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "dns_zone" {
  type = object({
    arn          = string
    name         = string
    name_servers = list(string)
    zone_id      = string
  })
}

variable "api_gateway_url" {
  type = string
}

variable "ui_bucket_domain_name" {
  type = string
}

terraform {
  required_providers {
    aws = {}
  }
}
