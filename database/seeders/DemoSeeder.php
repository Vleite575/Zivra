<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Like;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * Demo accounts with posts, likes, comments and follows so the feed looks alive locally.
 * Idempotent: rerunning skips accounts that already exist. Password for all: "password".
 * Run: php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    private const PEOPLE = [
        ['Marina Costa', 'marina_costa', 'Fotografia de rua e café forte. São Paulo.', true, [
            ['Fim de tarde na Paulista. A luz dessa hora não tem igual.', [255, 140, 60]],
            ['Achei uma padaria que abre às 6h e o pão de queijo é absurdo.', null],
            ['Treino de composição: só linhas e sombras hoje.', [40, 40, 60]],
        ]],
        ['Rafael Nunes', 'rafa_nunes', 'Dev, ciclista de fim de semana.', true, [
            ['60 km hoje na Serra. Pernas pedindo arrego.', [60, 160, 90]],
            ['Deploy na sexta? Nunca mais. Aprendi.', null],
        ]],
        ['Júlia Andrade', 'ju_andrade', 'Cozinho mais do que deveria.', true, [
            ['Primeira tentativa de pão de fermentação natural. Aprovado em casa.', [200, 150, 90]],
            ['Feira de domingo rendeu: manga, caqui e muito manjericão.', [230, 190, 50]],
            ['Alguém tem receita boa de moqueca vegana?', null],
        ]],
        ['Pedro Lima', 'pedrolima', 'Música, vinil e conversa boa.', true, [
            ['Garimpo de vinil no centro. Achei um Clube da Esquina original!', [90, 60, 140]],
            ['Show hoje no Sesc. Quem vai?', null],
        ]],
        ['Lu Ferreira', 'lu_ferreira', 'Perfil fechado, mas pode pedir pra seguir.', false, [
            ['Viagem pra serra confirmada. Só eu e um livro.', [70, 120, 180]],
            ['Dia de não fazer nada. Merecido.', null],
        ]],
    ];

    private const COMMENTS = ['Que lindo!', 'Quero ir junto da próxima vez', 'Muito bom 👏', 'Isso aí!', 'Me passa o endereço?'];

    public function run(): void
    {
        $users = collect();
        foreach (self::PEOPLE as $i => [$name, $username, $bio, $public, $posts]) {
            $user = User::where('username', $username)->first();
            if ($user) { $users->push($user); continue; }

            $user = User::forceCreate([
                'name' => $name, 'username' => $username, 'bio' => $bio, 'is_public' => $public,
                'email' => "$username@zivra.test", 'email_verified_at' => now(),
                'birth_date' => '1995-01-01', 'password' => Hash::make('password'),
            ]);
            $users->push($user);

            foreach ($posts as $j => [$content, $color]) {
                $post = new Post(['content' => $content, 'user_id' => $user->id]);
                if ($color) {
                    $post->media_path = $this->image($color);
                    $post->media_type = 'image';
                }
                $post->created_at = $post->updated_at = now()->subHours($i * 7 + $j * 19 + 1);
                $post->save();
            }
        }

        // Everyone follows everyone (accepted), so private posts show up for the other demo accounts too.
        foreach ($users as $a) {
            foreach ($users as $b) {
                if ($a->isNot($b)) $a->allFollowing()->syncWithoutDetaching([$b->id => ['accepted_at' => now()]]);
            }
        }

        foreach (Post::whereIn('user_id', $users->pluck('id'))->get() as $k => $post) {
            foreach ($users->where('id', '!=', $post->user_id)->take(1 + $k % 4) as $liker) {
                Like::firstOrCreate(['user_id' => $liker->id, 'post_id' => $post->id]);
            }
            if ($k % 2 === 0 && $post->comments()->doesntExist()) {
                $author = $users->firstWhere('id', '!=', $post->user_id);
                Comment::create(['user_id' => $author->id, 'post_id' => $post->id, 'content' => self::COMMENTS[$k % count(self::COMMENTS)]]);
            }
        }
    }

    /** A 4:5 vertical gradient JPEG on the private disk, same place uploads go. */
    private function image(array $rgb): string
    {
        [$w, $h] = [800, 1000];
        $img = imagecreatetruecolor($w, $h);
        for ($y = 0; $y < $h; $y++) {
            $t = $y / $h;
            $c = array_map(fn ($v) => (int) ($v * (1 - 0.6 * $t)), $rgb);
            imageline($img, 0, $y, $w, $y, imagecolorallocate($img, ...$c));
        }
        ob_start();
        imagejpeg($img, null, 85);
        $path = 'posts-media/demo-'.bin2hex(random_bytes(8)).'.jpg';
        Storage::disk('local')->put($path, ob_get_clean());

        return $path;
    }
}
