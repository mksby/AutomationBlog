output "server_ip" {
  description = "Public IPv4 address of the VPS"
  value       = hcloud_server.blog.ipv4_address
}

output "server_ipv6" {
  description = "Public IPv6 address of the VPS"
  value       = hcloud_server.blog.ipv6_address
}

output "server_status" {
  description = "Server status"
  value       = hcloud_server.blog.status
}
