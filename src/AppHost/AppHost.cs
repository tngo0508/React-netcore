var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.Api>("api")
    .WithHttpHealthCheck("/health");

builder.AddViteApp("client", "../client")
    .WithReference(api)
    .WaitFor(api)
    .WithExternalHttpEndpoints();

builder.Build().Run();
