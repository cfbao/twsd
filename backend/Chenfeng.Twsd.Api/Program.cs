using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.RuntimeSupport;

await LambdaBootstrapBuilder
	.Create<APIGatewayHttpApiV2ProxyRequest, APIGatewayHttpApiV2ProxyResponse>(
		Chenfeng.Twsd.Api.Handler.Handle,
		new LambdaSerializer())
	.Build()
	.RunAsync();

internal partial class LambdaSerializer : ILambdaSerializer
{
	[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyRequest))]
	[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyResponse))]
	[JsonSourceGenerationOptions(PropertyNameCaseInsensitive = true)]
	private partial class ApiJsonContext : JsonSerializerContext { }

	public T Deserialize<T>(Stream requestStream)
	{
		return (T)(object)JsonSerializer.Deserialize(
			requestStream,
			ApiJsonContext.Default.APIGatewayHttpApiV2ProxyRequest)!;
	}

	public void Serialize<T>(T response, Stream responseStream)
	{
		JsonSerializer.Serialize(
			responseStream,
			(APIGatewayHttpApiV2ProxyResponse)(object)response!,
			ApiJsonContext.Default.APIGatewayHttpApiV2ProxyResponse);
	}
}
