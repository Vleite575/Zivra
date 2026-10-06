<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Local test accounts (factory password: "password").
        User::factory()->create(['name' => 'Ana Teste', 'username' => 'ana_teste', 'email' => 'ana@zivra.test']);
        User::factory()->create(['name' => 'Beto Privado', 'username' => 'beto_privado', 'email' => 'beto@zivra.test', 'is_public' => false]);

        $this->call(DemoSeeder::class);
    }
}
