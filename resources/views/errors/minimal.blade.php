<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>@yield('title') - Zivra</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body {
                font-family: 'Figtree', sans-serif;
                background-color: #fafafa;
            }
            .zivra-gradient {
                background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
            }
        </style>
    </head>
    <body class="antialiased text-gray-900">
        <div class="min-h-screen flex flex-col items-center justify-center p-6">
            <div class="text-center max-w-md">
                <h1 class="text-6xl font-black text-transparent bg-clip-text zivra-gradient mb-4">
                    @yield('code')
                </h1>
                
                <h2 class="text-2xl font-bold text-gray-800 mb-6">
                    @yield('message')
                </h2>

                <p class="text-gray-600 mb-8 leading-relaxed">
                    Ops! Parece que algo não saiu como esperado na Zivra. 
                    Mas não se preocupe, você pode voltar para o feed e continuar explorando.
                </p>

                <div class="space-y-4">
                    <a href="/Zivra" class="inline-block w-full zivra-gradient text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-1">
                        Voltar para a Zivra
                    </a>
                    
                    <button onclick="window.history.back()" class="inline-block w-full bg-white text-gray-700 font-bold py-3 px-8 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                        Voltar para a página anterior
                    </button>
                </div>
            </div>

            <footer class="mt-12 text-sm text-gray-400">
                &copy; {{ date('Y') }} Zivra - Uma nova experiência social.
            </footer>
        </div>
    </body>
</html>
