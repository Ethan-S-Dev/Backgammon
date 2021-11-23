FROM mcr.microsoft.com/dotnet/aspnet:5.0 AS base
WORKDIR /app
EXPOSE 80

FROM node:16.13-alpine AS client 
ARG skip_client_build=false 
WORKDIR /app 
COPY Backgammon.Client/ClientApp .
RUN [[ ${skip_client_build} = true ]] && echo "Skipping npm install" || npm install 
RUN [[ ${skip_client_build} = true ]] && mkdir dist || npm run-script build

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY ["Backgammon.Client/Backgammon.Client.csproj", "Backgammon.Client/"]
RUN dotnet restore "Backgammon.Client/Backgammon.Client.csproj"
COPY . .
WORKDIR "/src/Backgammon.Client"
RUN dotnet build "Backgammon.Client.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Backgammon.Client.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY --from=client /app/dist /app/dist
ENTRYPOINT ["dotnet", "Backgammon.Client.dll"]