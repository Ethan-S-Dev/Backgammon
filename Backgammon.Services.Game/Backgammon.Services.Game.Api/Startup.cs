using Backgammon.Services.Game.Api.HubConfig;
using Backgammon.Services.Game.App.Interfaces;
using Backgammon.Services.Game.App.Services;
using Backgammon.Services.Game.Domain.Interfaces;
using Backgammon.Services.Game.Infra;
using Backgammon.Services.Game.Infra.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Net.Http;

namespace Backgammon.Services.Game.Api
{
    public class Startup
    {
        IConfiguration _configuration;
        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
            services.AddSingleton<HttpClient>();
            services.AddSingleton<ICubeService, CubesService>();
            services.AddSingleton<IBoardManager, BoardsManager>();
            services.AddScoped<IPlayerService, PlayersService>();
            services.AddScoped<IRepository, Repository>();
            services.AddControllers();
            string conncetionString = _configuration.GetConnectionString("Def");
            services.AddDbContext<GameDataContext>(options => options.UseSqlServer(conncetionString));

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllHeaders",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                    });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, GameDataContext gamesContext)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            //DbConfiguration
            gamesContext.Database.EnsureDeleted();
            gamesContext.Database.EnsureCreated();

            app.UseRouting();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute("default", "{controller=Game}/{action=RollCubess}/{id?}");
                endpoints.MapHub<GameHub>("/game");
            });
        }
    }
}
