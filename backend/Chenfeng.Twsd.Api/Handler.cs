using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;

namespace Chenfeng.Twsd.Api;

internal static partial class Handler
{
	private const string TableName = "twsd-messages";
	private const string IdAttribute = "Id";
	private const string IvAttribute = "Iv";
	private const string CiphertextAttribute = "Ciphertext";
	private const string ExpiresAtAttribute = "ExpiresAt";
	private static readonly AmazonDynamoDBClient dynamodb = new();

	public static async Task<APIGatewayHttpApiV2ProxyResponse> Handle(APIGatewayHttpApiV2ProxyRequest request)
	{
		if (request.RouteKey == "POST /api/message")
		{
			var encryptedMessage = JsonSerializer.Deserialize(request.Body, RequestJsonContext.Default.EncryptedMessage)!;
			await dynamodb.PutItemAsync(new()
			{
				TableName = TableName,
				Item = new()
				{
					[IdAttribute] = new(encryptedMessage.Id),
					[IvAttribute] = new(encryptedMessage.Iv),
					[CiphertextAttribute] = new(encryptedMessage.Ciphertext),
					[ExpiresAtAttribute] = new() { N = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds().ToString() },
				}
			});
			return new() { StatusCode = 200 };
		}

		if (request.RouteKey == "DELETE /api/message/{id}")
		{
			if (!request.PathParameters.TryGetValue("id", out string? id) || string.IsNullOrEmpty(id))
			{
				return new() { StatusCode = 404 };
			}

			var item = (await dynamodb.DeleteItemAsync(new()
			{
				TableName = TableName,
				Key = new() { ["Id"] = new(id) },
				ReturnValues = ReturnValue.ALL_OLD,
			})).Attributes;

			if (!item.TryGetValue(ExpiresAtAttribute, out var expiresAtValue)
				|| long.Parse(expiresAtValue.N) < DateTimeOffset.UtcNow.ToUnixTimeSeconds())
			{
				return new() { StatusCode = 404 };
			}

			var encryptedMessage = new EncryptedMessage(
				Id: item[IdAttribute].S,
				Iv: item[IvAttribute].S,
				Ciphertext: item[CiphertextAttribute].S);

			return new()
			{
				StatusCode = 200,
				Body = JsonSerializer.Serialize(encryptedMessage, RequestJsonContext.Default.EncryptedMessage),
			};
		}

		throw new NotImplementedException();
	}

	[JsonSerializable(typeof(EncryptedMessage))]
	[JsonSourceGenerationOptions(JsonSerializerDefaults.Web)]
	private partial class RequestJsonContext : JsonSerializerContext { }

	private record EncryptedMessage(
		string Id,
		string Iv,
		string Ciphertext);
}
