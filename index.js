const { Client, GatewayIntentBits, EmbedBuilder, Events, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { ClientSecret } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

const COMMANDS = [
    {
        name: 'wezwij',
        description: 'System Wzywania Organizacji I Gangów',
        options: [
            {
                type: 8, // Typ 8 oznacza Rolę
                name: 'rola',
                description: 'Oznacz rolę',
                required: true
            }
        ]
    },
    {
        name: 'weryfikacja',
        description: 'Weryfikuje użytkownika i wysyła wiadomość w embed.',
    },
    {
        name: 'rozwiaz',
        description: 'Usuwa członków z oznaczonej roli.',
        options: [
            {
                type: 8, // Typ 8 oznacza Rolę
                name: 'rola',
                description: 'Oznacz rolę do usunięcia',
                required: true
            }
        ]
    },
    {
        name: 'ticket',
        description: 'Tworzy ticket z przyciskami.',
    }
];

async function main() {
    try {
        const rest = new REST({ version: '10' }).setToken(ClientSecret.TOKEN);
        console.log('Rozpoczynam rejestrację poleceń...');
        await rest.put(Routes.applicationGuildCommands(client.user.id, 'GuildID'), { body: COMMANDS }); // Discord ID Serwera
        console.log('Polecenia zostały zarejestrowane!');
    } catch (error) {
        console.error('Błąd podczas rejestrowania poleceń:', error);
    }
}

client.on(Events.ClientReady, async () => {
    console.log(`Zalogowano jako ${client.user.tag}!`);
    await main();
});

// Funkcja obsługująca dołączenie nowego członka
client.on(Events.GuildMemberAdd, async (member) => {
    const roleIds = [
        "1277998905044373629",// NADAWANIE RANGI PO DOŁACZENIU
        "1277998905002557560",// NADAWANIE RANGI PO DOŁACZENIU
        "1277998905002557558",// NADAWANIE RANGI PO DOŁACZENIU
        "1277998904931127312",// NADAWANIE RANGI PO DOŁACZENIU
        "1277998904910024776",// NADAWANIE RANGI PO DOŁACZENIU
        "1277998904910024773"// NADAWANIE RANGI PO DOŁACZENIU
    ];

    try {
        const roles = roleIds.map(roleId => member.guild.roles.cache.get(roleId)).filter(role => role);
        await member.roles.add(roles);
        console.log(`Nadano rangi dla ${member.user.tag}`);

        const joinChannelId = 'TWOJE_ID_KANALU'; // ID Kanału Z Powitaniami
        const joinChannel = await client.channels.fetch(joinChannelId);
        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('Nowy Użytkownik!')
            .setDescription(`<@${member.id}> dołączył na nasz serwer.`);

        await joinChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Błąd podczas nadawania ról:', error);
    }
});

// Obsługa komend
client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
        const { commandName, options, member } = interaction;

        if (commandName === 'wezwij') {
            const targetRole = options.getRole('rola');
            const channelToNotify = '1277998905510068325';// Kanał z Wezwaniami
            const channelForConfirmation = '1277998905711132777'; // Kanal Z Potwierdzeniami
            const wezwijid = '1277999084359254037'; // Rola Z Uprawnieniami

            if (!member.roles.cache.has(wezwijid)) {
                return interaction.reply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Zaproszenie')
                .setDescription(`Zapraszamy Członka Zarządu! Jesteście wezwani przez <@${member.id}>`)
                .addFields({ name: 'Kanał:', value: `<#${channelForConfirmation}>` });

            try {
                const specifiedChannel = await client.channels.fetch(channelToNotify);
                await specifiedChannel.send({ content: `<@&${targetRole.id}>`, embeds: [embed] });

                const confirmationChannel = await client.channels.fetch(channelForConfirmation);
                await confirmationChannel.send(`<@${member.id}> Wezwał Organizacje Lub Gang: <@&${targetRole.id}>`);

                await interaction.reply({ content: 'Wezwanie zostało wysłane!', ephemeral: true });
            } catch (error) {
                console.error('Błąd podczas wysyłania wezwania:', error);
                await interaction.reply({ content: 'Wystąpił błąd podczas wysyłania wezwania.', ephemeral: true });
            }

        } else if (commandName === 'weryfikacja') {
            if (member.id !== '1096536441783333025') {
                return interaction.reply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
            }

            const verificationChannelId = '1277998905069535239';
            const verifyButton = new ButtonBuilder()
                .setCustomId('verify_user')
                .setLabel('Zweryfikuj się')
                .setStyle(ButtonStyle.Success);

            const embed = new EmbedBuilder()
                .setColor('#32CD32')
                .setTitle('Weryfikacja')
                .setDescription(`Uźytkowniku(czko)! Kliknij w Przycisk Poniżej Aby Się Zweryfikować.`);

            const verificationChannel = await client.channels.fetch(verificationChannelId);
            await verificationChannel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(verifyButton)] });
            
            await interaction.reply({ content: 'Weryfikacja została rozpoczęta!', ephemeral: true });

        } else if (commandName === 'rozwiaz') {
            const authorizedRoleId = '1277998904910024769'; // ID rangi, która ma uprawnienia do użycia komendy // ID UPRAWNIEN DO ROZWIAZYWANIA
            const targetRole = options.getRole('rola');

            if (!member.roles.cache.has(authorizedRoleId)) {
                return interaction.reply({ content: 'Nie masz uprawnień do używania tej komendy.', ephemeral: true });
            }

            try {
                const roleIdsToRemove = [
                    "1277998905044373624", // KTORE ROLE MA USUNAC
                    "1277998905044373625",// KTORE ROLE MA USUNAC
                    "1277998905044373626",// KTORE ROLE MA USUNAC
                    "1277998905044373627",// KTORE ROLE MA USUNAC
                    "1277998905044373628"// KTORE ROLE MA USUNAC
                ];

                // Usunięcie roli od każdego członka
                const membersWithRole = targetRole.members;
                await Promise.all(membersWithRole.map(memberWithRole => {
                    const rolesToRemove = roleIdsToRemove.map(roleId => memberWithRole.roles.cache.get(roleId)).filter(role => role);
                    return memberWithRole.roles.remove(rolesToRemove);
                }));

                const announcementChannelId = '1277998905510068319'; // Kanał do wysyłania informacji
                const announcementChannel = await client.channels.fetch(announcementChannelId);

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('Rola Rozwiązana!')
                    .setDescription(`@${targetRole.name} została Rozwiązana przez <@${member.id}>`);

                await announcementChannel.send({ content: `<@&${targetRole.id}>`, embeds: [embed] });
                await interaction.reply({ content: 'Rola została rozwiązana!', ephemeral: true });
            } catch (error) {
                console.error('Błąd podczas usuwania roli:', error);
                await interaction.reply({ content: 'Wystąpił błąd podczas usuwania roli.', ephemeral: true });
            }
        } else if (commandName === 'ticket') {
            const ticketChannelId = '1277998905510068326';
            const ticketButton1 = new ButtonBuilder()
                .setCustomId('ticket_button_1')
                .setLabel('Przycisk 1')
                .setStyle(ButtonStyle.Primary);
            const ticketButton2 = new ButtonBuilder()
                .setCustomId('ticket_button_2')
                .setLabel('Przycisk 2')
                .setStyle(ButtonStyle.Secondary);
            const ticketButton3 = new ButtonBuilder()
                .setCustomId('ticket_button_3')
                .setLabel('Przycisk 3')
                .setStyle(ButtonStyle.Danger);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('Nowy Ticket')
                .setDescription('Proszę wybrać jedną z opcji poniżej.');

            const ticketChannel = await client.channels.fetch(ticketChannelId);
            await ticketChannel.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(ticketButton1, ticketButton2, ticketButton3)] });
            await interaction.reply({ content: 'Ticket został wysłany!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith('ticket_button_')) {
            const ticketCategoryId = '1278120572030816338'; // KATEGORIA DO TICKETOW
            const roleId = '1278120739618426880'; // Rola, która będzie miała dostęp do ticketa
            const ticketChannelName = `ticket-${interaction.user.username}-${interaction.user.discriminator}`;

            const guild = interaction.guild;

            try {
                const ticketChannel = await guild.channels.create(ticketChannelName, {
                    type: 'GUILD_TEXT',
                    parent: ticketCategoryId,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: ['VIEW_CHANNEL'], // Zablokuj widoczność dla wszystkich
                        },
                        {
                            id: roleId,
                            allow: ['VIEW_CHANNEL'], // Pozwól widzieć rolę
                        },
                        {
                            id: interaction.user.id,
                            allow: ['VIEW_CHANNEL'], // Pozwól widzieć autora ticketa
                        }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setColor('#32CD32')
                    .setTitle('Nowy Ticket')
                    .setDescription('Witaj! Możesz rozmawiać tutaj z administracją.');

                await ticketChannel.send({ embeds: [embed] });

                await interaction.reply({ content: `Ticket został otwarty: ${ticketChannel}`, ephemeral: true });
            } catch (error) {
                console.error('Błąd podczas tworzenia ticketa:', error);
                await interaction.reply({ content: 'Wystąpił błąd podczas tworzenia ticketa.', ephemeral: true });
            }
        } else if (interaction.customId === 'verify_user') {
            const role = interaction.guild.roles.cache.get('1277998905002557559');
            const verificationChannel = '1277999817661878302'; // Kanał do wysłania informacji o weryfikacji

            if (!role) {
                return interaction.reply({ content: 'Nie mogę znaleźć roli do nadania.', ephemeral: true });
            }

            try {
                await interaction.member.roles.add(role);
                await interaction.reply({ content: 'Pomyślnie Się Zweryfikowałeś(aś) Na Serwerze TWOJA_NAZWA_BOTA', ephemeral: true });
                await interaction.user.send('Pomyślnie Się Zweryfikowałeś(aś) Na Serwerze TWOJA_NAZWA_BOTA');

                const channel = await client.channels.fetch(verificationChannel);
                await channel.send(`<@${interaction.user.id}> zweryfikował się.`);
            } catch (error) {
                console.error('Błąd podczas nadawania roli:', error);
                await interaction.reply({ content: 'Wystąpił błąd podczas nadawania roli.', ephemeral: true });
            }
        }
    }
});

// Zalogowanie bota
client.login(ClientSecret.TOKEN);
