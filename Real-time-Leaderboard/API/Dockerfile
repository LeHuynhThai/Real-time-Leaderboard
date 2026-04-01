FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy everything and publish
COPY . .
RUN dotnet restore "API/API.csproj"
RUN dotnet publish "API/API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Copy wait script
COPY API/wait-for.sh /wait-for.sh
RUN sed -i 's/\r//' /wait-for.sh && chmod +x /wait-for.sh

ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

ENTRYPOINT ["/wait-for.sh", "dotnet", "API.dll"]
