using Amazon.Lambda.RuntimeSupport;

var outputStream = new MemoryStream();

await new LambdaBootstrap(Handler).RunAsync();

Task<InvocationResponse> Handler(InvocationRequest invocation)
{
	outputStream.SetLength(0);

	outputStream.Write("Hello, World!"u8);

	outputStream.Position = 0;
	return Task.FromResult(new InvocationResponse(outputStream, disposeOutputStream: false));
}
