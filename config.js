/* config.js — TUDO que você edita fica aqui: chaves do Supabase, elenco, loja e economia de PG Coins. */
window.HubData = (() => {

  const CONFIG = {
    SUPABASE_URL: 'https://vlgptjyukhdvhgipilwi.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_VRvE2fdP-t1VI4uzfZB-Mw_svTCuGGW',    
           // <- cole a chave "anon public"
    MIN_LOAD_MS: 1200,
    AUDIO: { music: {}, click: '', hit: '', miss: '', tap: '', win: '' }   // opcional: URLs de arquivos (ex.: music: { menu: 'assets/music/menu.mp3' })
  };

  const GAMES = {
    corrida: { name: 'Corrida da Fé', hero: 'Elias', ref: '1 Rs 18:46', verse: 'A mão do Senhor foi sobre Elias, e ele correu.' },
    muros: { name: 'Muros de Neemias', hero: 'Neemias', ref: 'Ne 2:18', verse: 'Levantemo-nos e edifiquemos.' },
    pesca: { name: 'Pescadores de Homens', hero: 'Pedro', ref: 'Mt 4:19', verse: 'Vinde após mim, e eu vos farei pescadores de homens.' },
    davi: { name: 'Funda de Davi', hero: 'Davi', ref: '1 Sm 17:47', verse: 'Do Senhor é a guerra.' },
    sansao: { name: 'Força de Sansão', hero: 'Sansão', ref: 'Jz 16:28', verse: 'Esforça-me só esta vez, ó Deus.' }
  };

  /* Economia: moedas = min(cap, pontos / div) + moedas de itens dourados (raras), × bônus da Sabedoria. */
  const ECON = {
    corrida: { div: 35, cap: 22 }, muros: { div: 9, cap: 22 }, pesca: { div: 55, cap: 22 },
    davi: { div: 20, cap: 22 }, sansao: { div: 30, cap: 22 }
  };

  const VERSES = [
    'Tudo posso naquele que me fortalece. — Fp 4:13', 'O Senhor é o meu pastor; nada me faltará. — Sl 23:1',
    'Sê forte e corajoso. — Js 1:9', 'Se Deus é por nós, quem será contra nós? — Rm 8:31',
    'Lança sobre o Senhor o teu cuidado. — Sl 55:22', 'Não temas, porque eu sou contigo. — Is 41:10'
  ];

  /* Elenco (a ordem aqui é a ordem na tela). Para adicionar alguém, copie uma linha e use um id novo e único.
     look: body 'm'|'f', build 'strong', skin, eyes, hair, style (short|curly|long|wavy|braid|bun|bald), beard (short|long),
           head {type:'turban'|'helmet'|'veil', color}, outfit {kind:'tunic'|'robe'|'armor'|'bare', color, trim, sash, cloak, stripes, sleeves}, acc {crown:true}
     Arte própria (opcional): img (retrato quadrado) e art (corpo inteiro PNG) em assets/characters/. */
  const AVATARS = [
    {
      id: 12, name: 'Douglas', role: 'Líder de jovens', bio: 'Líder do PG Jovem. Aqui entra uma frase sobre ele (edite no config.js).', stats: [100, 100, 100],
      look: { body: 'm', skin: '#d6a077', hair: '#2a1a10', style: 'short', outfit: { kind: 'tunic', color: '#2f6fb0', trim: '#ffffff', sash: '#ff2d95' } }
    },
    {
      id: 13, name: 'Thais', role: 'Líder de jovens', bio: 'Líder do PG Jovem. Aqui entra uma frase sobre ela (edite no config.js).', stats: [100, 100, 100],
      look: { body: 'f', skin: '#dfae86', hair: '#7a4322', style: 'wavy', outfit: { kind: 'tunic', color: '#c2417a', trim: '#ffc94d', sash: '#ffc94d' } }
    },
    {
      id: 19, name: 'Thiago', role: 'Baterista Mirim', bio: 'Já manda ver na baqueta. Baterista Mirim: já é melhor que o Wesley!', stats: [100, 100, 100],
      look: { body: 'm', build: 'kid', skin: '#d6a077', hair: '#2a1a10', style: 'short', outfit: { kind: 'tunic', color: '#2f6fb0', trim: '#ffffff', sash: '#ff2d95' }, prop: 'drumstick' }
    },
    {
      id: 18, name: 'Capivara', role: 'Apaixonado por música', bio: 'Violão no colo e coração cheio de melodia. A capivara é calma, é louvor e é apaixonada...por música!', stats: [100, 100, 100],
      look: { body: 'm', animal: 'capy', love: true, skin: '#a8764a', hair: '#6a4326', style: 'none', eyes: '#3a2616', outfit: { kind: 'tunic', color: '#2a9aa8', trim: '#ffd9ec', sash: '#ff7ab8' }, prop: 'guitar' }
    },
    {
      id: 0, name: 'Davi', role: 'O pastor que virou rei', bio: 'Pastor de ovelhas que enfrentou Golias com uma funda e fé. Foi rei e escreveu muitos salmos.', stats: [90, 95, 70],
      look: { body: 'm', skin: '#e0b088', hair: '#a8552a', style: 'curly', outfit: { kind: 'tunic', color: '#b08a3a', trim: '#5a3f1e', sash: '#7a4a22' }, prop: 'sling' }
    },
    {
      id: 1, name: 'Ester', role: 'Coragem de rainha', bio: 'Jovem judia que virou rainha da Pérsia e arriscou a própria vida para salvar o seu povo.', stats: [85, 100, 80],
      look: { body: 'f', skin: '#d9a073', hair: '#241410', style: 'long', acc: { crown: true }, outfit: { kind: 'robe', color: '#7a2fc0', trim: '#ffc94d', sash: '#ffc94d' } }
    },
    {
      id: 2, name: 'Daniel', role: 'Fiel na cova dos leões', bio: 'Levado cativo para a Babilônia, manteve-se fiel a Deus até na cova dos leões.', stats: [100, 80, 95],
      look: { body: 'm', skin: '#c58a5c', hair: '#2a1a10', style: 'short', beard: 'short', head: { type: 'turban', color: '#f2eadb' }, outfit: { kind: 'robe', color: '#2f6fb0', trim: '#ffc94d', sash: '#ffc94d' }, prop: 'scroll' }
    },
    {
      id: 3, name: 'Moisés', role: 'Libertador do povo', bio: 'Tirou o povo de Israel do Egito e recebeu os Dez Mandamentos no monte Sinai.', stats: [95, 85, 90],
      look: { body: 'm', skin: '#c58a5c', hair: '#e9e4dc', style: 'long', beard: 'long', outfit: { kind: 'robe', color: '#d8c7a4', trim: '#8a6a3a', sash: '#7a5a3a', cloak: '#8a5a32' }, prop: 'staff' }
    },
    {
      id: 4, name: 'Débora', role: 'Juíza e profetisa', bio: 'Juíza de Israel que liderou o povo com sabedoria e coragem, ao lado de Baraque.', stats: [90, 90, 100],
      look: { body: 'f', skin: '#9a6038', hair: '#1f130d', style: 'bun', head: { type: 'veil', color: '#ffe9c2' }, outfit: { kind: 'robe', color: '#a02a5a', trim: '#ffc94d', sash: '#ffc94d' } }
    },
    {
      id: 5, name: 'José', role: 'Do poço ao palácio', bio: 'Vendido pelos irmãos, chegou a governador do Egito e escolheu perdoar a todos.', stats: [95, 70, 100],
      look: { body: 'm', skin: '#c58a5c', hair: '#2a1a10', style: 'curly', outfit: { kind: 'tunic', color: '#e0553a', stripes: true, sleeves: 'long' } }
    },
    {
      id: 6, name: 'Rute', role: 'Lealdade que não solta', bio: 'Estrangeira que ficou ao lado da sogra Noemi e entrou na família do rei Davi.', stats: [100, 75, 85],
      look: { body: 'f', skin: '#d9a073', hair: '#4a2a18', style: 'braid', outfit: { kind: 'tunic', color: '#3f8f5f', trim: '#e8c35a', sash: '#e8c35a' }, prop: 'wheat' }
    },
    {
      id: 7, name: 'Josué', role: 'Sê forte e corajoso', bio: 'Sucessor de Moisés. Conduziu Israel à terra prometida e viu as muralhas de Jericó caírem.', stats: [90, 100, 75],
      look: { body: 'm', skin: '#b87a52', hair: '#3b2414', style: 'short', beard: 'short', head: { type: 'helmet' }, outfit: { kind: 'armor', color: '#6a5a8a', trim: '#ffc94d', sash: '#7a5a3a' }, prop: 'sword' }
    },
    {
      id: 8, name: 'Gideão', role: '300 homens e uma trombeta', bio: 'Com apenas 300 homens, trombetas e tochas, venceu o enorme exército de Midiã.', stats: [80, 90, 85],
      look: { body: 'm', skin: '#c98f63', hair: '#3b2414', style: 'short', beard: 'short', outfit: { kind: 'tunic', color: '#9a6a2a', trim: '#5a3a1a', sash: '#3a2415' }, prop: 'torch' }
    },
    {
      id: 9, name: 'Paulo', role: 'Corri a carreira', bio: 'Perseguia a Igreja, até encontrar Jesus. Depois levou o evangelho ao mundo e escreveu várias cartas.', stats: [100, 95, 90],
      look: { body: 'm', skin: '#d9a077', hair: '#4a3a30', style: 'bald', beard: 'short', outfit: { kind: 'robe', color: '#7a4a9a', trim: '#ffc94d', sash: '#ffc94d', cloak: '#4a2a6a' }, prop: 'scroll' }
    },
    {
      id: 10, name: 'Miriã', role: 'Louvor depois do mar', bio: 'Irmã de Moisés. Louvou a Deus com pandeiro depois de atravessar o mar Vermelho.', stats: [90, 80, 85],
      look: { body: 'f', skin: '#8a5230', hair: '#1a0f0a', style: 'curly', outfit: { kind: 'tunic', color: '#2a9aa8', trim: '#ffd9ec', sash: '#ff7ab8' }, prop: 'tambourine' }
    },
    {
      id: 11, name: 'Salomão', role: 'O rei mais sábio', bio: 'Filho de Davi. Pediu sabedoria a Deus, tornou-se o rei mais sábio e construiu o templo.', stats: [85, 70, 100],
      look: { body: 'm', skin: '#c58a5c', hair: '#2a1608', style: 'short', beard: 'short', acc: { crown: true }, outfit: { kind: 'robe', color: '#6a2a9a', trim: '#ffc94d', sash: '#ffc94d', cloak: '#3a1560' }, prop: 'scroll' }
    },
    {
      id: 14, name: 'Elias', role: 'Fogo no Carmelo', bio: 'Profeta que desafiou os profetas de Baal no monte Carmelo e correu diante da carruagem do rei.', stats: [90, 100, 80],
      look: { body: 'm', skin: '#b87a52', hair: '#3a2415', style: 'long', beard: 'long', outfit: { kind: 'tunic', color: '#7a5430', trim: '#3a2415', sash: '#3a2415', cloak: '#5a3a20' }, prop: 'staff' }
    },
    {
      id: 15, name: 'Neemias', role: 'Construtor de muros', bio: 'Copeiro do rei que voltou a Jerusalém e reconstruiu a muralha em 52 dias.', stats: [90, 85, 95],
      look: { body: 'm', skin: '#c58a5c', hair: '#2a1a10', style: 'short', beard: 'short', head: { type: 'turban', color: '#efe7d2' }, outfit: { kind: 'tunic', color: '#2f6fb0', trim: '#ffc94d', sash: '#7a5a3a' }, prop: 'trowel' }
    },
    {
      id: 16, name: 'Pedro', role: 'Pescador de homens', bio: 'Pescador chamado por Jesus para pescar pessoas. Tornou-se líder da Igreja nascente.', stats: [80, 95, 75],
      look: { body: 'm', skin: '#b07a50', hair: '#6a5a4a', style: 'curly', beard: 'short', outfit: { kind: 'tunic', color: '#3b8f8a', trim: '#1a4a5e', sash: '#d2b47c' }, prop: 'net' }
    },
    {
      id: 17, name: 'Sansão', role: 'Força de gigante', bio: 'Juiz de Israel com força extraordinária. No fim, derrubou o templo de Dagom.', stats: [70, 100, 60],
      look: { body: 'm', build: 'strong', skin: '#c98856', hair: '#2a1608', style: 'long', beard: 'short', outfit: { kind: 'bare', color: '#efe3c8', trim: '#c9a25a' } }
    }
  ];

  /* Inimigo (não é jogável, a loja não muda ele) */
  const NPC = {
    golias: {
      body: 'm', build: 'strong', skin: '#b87a52', hair: '#2a1a10', style: 'short', beard: 'long', eyes: '#2a1a10', head: { type: 'helmet' },
      outfit: { kind: 'armor', color: '#7a4a22', trim: '#b9833f', sash: '#b9833f' }, shield: true
    }
  };

  /* Loja. Roupas são visuais COMPLETOS (trocam a roupa inteira do personagem). */
  const SHOP = {
    attr: [
      { id: 'fe', name: 'Fé', desc: '+1 vida (ou escudo) por nível, em todos os jogos', max: 3, cost: [150, 420, 950] },
      { id: 'coragem', name: 'Coragem', desc: 'Os jogos começam 6% mais lentos por nível', max: 5, cost: [100, 220, 420, 720, 1150] },
      { id: 'sabedoria', name: 'Sabedoria', desc: '+10% de PG Coins ao fim de cada partida, por nível', max: 5, cost: [160, 340, 620, 1000, 1600] },
      { id: 'foco', name: 'Foco', desc: 'Zonas de acerto e margens de erro 8% maiores por nível', max: 4, cost: [120, 260, 520, 900] },
      { id: 'sorte', name: 'Sorte', desc: 'Itens dourados (que dão moedas) aparecem mais vezes', max: 3, cost: [200, 520, 1100] },
      { id: 'vigor', name: 'Vigor', desc: 'Mais folga: tempo extra, perdoa mais erros e inimigos mais lentos', max: 3, cost: [180, 450, 900] }
    ],
    outfit: [
      { id: 'mar', name: 'Pescador', cost: 220, look: { kind: 'tunic', color: '#2a7f9a', trim: '#1a4a5e', sash: '#d9c18a' } },
      { id: 'neon', name: 'Túnica Neon', cost: 220, look: { kind: 'tunic', color: '#ff2d95', trim: '#ffc94d', sash: '#ffffff' } },
      { id: 'pastor', name: 'Manto de Pastor', cost: 300, look: { kind: 'tunic', color: '#8a6a3e', trim: '#d9c9a0', sash: '#5a3f1e', cloak: '#d9ceb4' } },
      { id: 'linho', name: 'Linho Branco', cost: 300, look: { kind: 'robe', color: '#f0ead8', trim: '#d4b46a', sash: '#c9a25a' } },
      { id: 'jose', name: 'Túnica de José', cost: 380, look: { kind: 'tunic', color: '#e0553a', stripes: true, sleeves: 'long' } },
      { id: 'brasa', name: 'Fogo do Carmelo', cost: 450, look: { kind: 'tunic', color: '#d4451f', trim: '#ffb04d', sash: '#ffc94d', cloak: '#8a1f10' } },
      { id: 'levita', name: 'Veste de Levita', cost: 550, look: { kind: 'robe', color: '#1f3f7a', trim: '#ffc94d', sash: '#ffc94d' } },
      { id: 'real', name: 'Manto Real', cost: 700, look: { kind: 'robe', color: '#4b1e8a', trim: '#ffc94d', sash: '#ffc94d', cloak: '#7a1fa2' } },
      { id: 'bronze', name: 'Armadura de Bronze', cost: 800, look: { kind: 'armor', color: '#5a4a7a', trim: '#ffc94d', sash: '#7a5a3a' } },
      { id: 'gala', name: 'Gala PG Jovem', cost: 1000, look: { kind: 'robe', color: '#17121f', trim: '#ff2d95', sash: '#ff2d95', cloak: '#0a0710' } }
    ],
    acc: [
      { id: 'faixa', name: 'Faixa PG', cost: 150, look: { headband: '#ff2d95' } },
      { id: 'redondo', name: 'Óculos Redondos', cost: 220, look: { glasses: true } },
      { id: 'oculos', name: 'Óculos Escuros', cost: 260, look: { shades: true } },
      { id: 'medalhao', name: 'Cruz de Ouro', cost: 450, look: { amulet: true } },
      { id: 'louros', name: 'Coroa de Louros', cost: 500, look: { laurel: true } },
      { id: 'aureola', name: 'Auréola', cost: 900, look: { halo: true } },
      { id: 'asas', name: 'Asas de Luz', cost: 1200, look: { wings: true } },
      { id: 'coroa', name: 'Coroa de Ouro', cost: 1500, look: { crown: true } }
    ],
    aura: [
      { id: 'a_rosa', name: 'Aura Rosa', cost: 500, color: '#ff2d95' },
      { id: 'a_ouro', name: 'Aura Dourada', cost: 600, color: '#ffc94d' },
      { id: 'a_azul', name: 'Aura Azul', cost: 600, color: '#4aa8ff' },
      { id: 'a_verde', name: 'Aura Verde', cost: 600, color: '#5dffb0' }
    ],
    /* Melhorias de jogo: 3 níveis cada, comprados em ordem */
    boost: [
      {
        game: 'corrida', tiers: [
          { id: 'asas', name: 'Asas de Fé', desc: 'Terceiro pulo no ar (pulo triplo)', cost: 250 },
          { id: 'asas2', name: 'Manto de Elias', desc: 'Segure para planar e a colisão fica mais justa', cost: 650 },
          { id: 'asas3', name: 'Carruagem de Fogo', desc: 'Ímã de pergaminhos e +1 escudo', cost: 1400 }]
      },
      {
        game: 'muros', tiers: [
          { id: 'prumo', name: 'Prumo de Neemias', desc: 'Linha-guia e encaixe perfeito mais fácil', cost: 250 },
          { id: 'prumo2', name: 'Esquadro Real', desc: 'A cada 3 perfeitos a pedra recupera largura', cost: 650 },
          { id: 'prumo3', name: 'Trombeta de Neemias', desc: '+1 falha permitida e pedra 12% mais lenta', cost: 1400 }]
      },
      {
        game: 'pesca', tiers: [
          { id: 'rede', name: 'Rede Reforçada', desc: 'Barco 20% mais largo', cost: 250 },
          { id: 'rede2', name: 'Barco do Mestre', desc: 'Atrai os peixes que passam perto', cost: 650 },
          { id: 'rede3', name: 'Cesto de Pães', desc: 'O combo sobe mais rápido (até x6)', cost: 1400 }]
      },
      {
        game: 'davi', tiers: [
          { id: 'pedra', name: 'Pedra Lisa', desc: 'A zona dourada nunca fica pequena demais', cost: 250 },
          { id: 'pedra2', name: 'Cinco Pedras', desc: 'A mira se move 15% mais devagar', cost: 650 },
          { id: 'pedra3', name: 'Bênção do Pastor', desc: 'Perdoa o primeiro erro de cada gigante', cost: 1400 }]
      },
      {
        game: 'sansao', tiers: [
          { id: 'cinto', name: 'Cinto de Força', desc: 'A barra de força esvazia 40% mais devagar', cost: 250 },
          { id: 'cinto2', name: 'Cabelos de Nazireu', desc: '+2 segundos de tempo', cost: 650 },
          { id: 'cinto3', name: 'Pilares Rachados', desc: 'Todos os pontos valem 25% mais', cost: 1400 }]
      }
    ]
  };

  return { CONFIG, GAMES, ECON, VERSES, AVATARS, NPC, SHOP };
})();
