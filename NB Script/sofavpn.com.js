/**
 * FOOTBALL STALKER - SofaScore
 * Author  : gienetic
 * Base  : https://play.google.com/store/apps/details?id=com.sofascore.results
 */

const axios = require('axios');
const dayjs = require('dayjs');

const headers = {
  'Host': 'sofavpn.com',
  'cache-control': 'max-age=0',
  'accept-encoding': 'gzip',
  'user-agent': 'com.sofascore.results/250702/110f52'
};

const posFull = {
  D: 'Bek',
  M: 'Gelandang',
  F: 'Penyerang',
  G: 'Kiper'
};

async function stalkPlayer(query) {
  const res = await axios.get('https://sofavpn.com/api/v1/search/all', {
    params: { q: query, page: 0 }, headers
  });

  const players = res.data.results.filter(r => r.type === 'player');
  if (!players.length) return '❌ Tidak ditemukan pemain.';

  let output = '';
  for (let i = 0; i < players.length; i++) {
    const e = players[i].entity;
    const detail = await axios.get(`https://sofavpn.com/api/v1/player/${e.id}`, { headers });
    const p = detail.data.player;
    const team = p.team || {};
    const league = team.tournament || {};
    const country = p.country || {};

    const dob = p.dateOfBirthTimestamp ? dayjs.unix(p.dateOfBirthTimestamp).format('D MMMM YYYY') : '-';
    const contractUntil = p.contractUntilTimestamp ? dayjs.unix(p.contractUntilTimestamp).format('D MMMM YYYY') : '-';
    const mv = p.proposedMarketValueRaw ? `€${p.proposedMarketValueRaw.value.toLocaleString('de-DE')}` : '-';

    output += `#${i + 1} - ${p.name}\n`;
    output += `  ➤ Nama Singkat    : ${p.shortName || '-'}\n`;
    output += `  ➤ Posisi            : ${p.position || '-'} (${posFull[p.position] || '-'})\n`;
    output += `  ➤ Nomor Punggung    : ${p.jerseyNumber || p.shirtNumber || '-'}\n`;
    output += `  ➤ Tinggi Badan      : ${p.height ? p.height + ' cm' : '-'}\n`;
    output += `  ➤ Kaki Dominan      : ${p.preferredFoot || '-'}\n`;
    output += `  ➤ Tanggal Lahir     : ${dob}\n`;
    output += `  ➤ Kontrak Hingga    : ${contractUntil}\n`;
    output += `  ➤ Harga Pasar       : ${mv}\n`;
    output += `  ➤ Tim               : ${team.name || '-'}\n`;
    output += `  ➤ Liga              : ${league.name || '-'}\n`;
    output += `  ➤ Negara            : ${country.name || '-'}\n`;
    output += `  ➤ Slug Pemain       : ${p.slug || '-'}\n`;
    output += `  ➤ Slug Tim          : ${team.slug || '-'}\n`;
    output += `  ➤ Gambar Pemain     : https://sofavpn.com/api/v1/player/${p.id}/image\n\n`;
  }

  return output.trim();
}

async function stalkTeam(query) {
  const res = await axios.get('https://sofavpn.com/api/v1/search/teams', {
    params: { q: query, page: 0 }, headers
  });

  const teams = res.data.results;
  if (!teams.length) return '❌ Tidak ditemukan tim.';

  let output = '';
  for (const [i, t] of teams.entries()) {
    const detail = await axios.get(`https://sofavpn.com/api/v1/team/${t.entity.id}`, { headers });
    const team = detail.data.team;
    const country = team.category?.country || {};
    const league = team.tournament || {};
    const manager = team.manager || {};
    const venue = team.venue || {};
    const form = detail.data.pregameForm || {};

    output += `#${i + 1} - ${team.name}\n`;
    output += `  ➤ Nama Singkat      : ${team.shortName || '-'}\n`;
    output += `  ➤ Olahraga          : ${team.sport?.name || '-'}\n`;
    output += `  ➤ Negara            : ${country.name || '-'}\n`;
    output += `  ➤ Liga              : ${league.name || '-'}\n`;
    output += `  ➤ Posisi Saat Ini   : ${form.position || '-'}\n`;
    output += `  ➤ Performa Terakhir : ${form.form?.join(', ') || '-'}\n`;
    output += `  ➤ Pelatih           : ${manager.name || '-'} (${manager.country?.name || '-'})\n`;
    output += `  ➤ Kota Stadion      : ${venue.city?.name || '-'}\n`;
    output += `  ➤ Lokasi Stadion    : ${venue.venueCoordinates ? `${venue.venueCoordinates.latitude}, ${venue.venueCoordinates.longitude}` : '-'}\n`;
    output += `  ➤ Slug Tim          : ${team.slug || '-'}\n`;
    output += `  ➤ Gambar Tim        : https://sofavpn.com/api/v1/team/${team.id}/image\n\n`;
  }

  return output.trim();
}

async function stalkMatch(query) {
  const res = await axios.get('https://sofavpn.com/api/v1/search/unique-tournaments', {
    params: { q: query, page: 0 }, headers
  });

  const results = res.data.results;
  if (!results.length) return '❌ Tidak ditemukan turnamen.';

  let output = '';
  for (const [i, result] of results.entries()) {
    const e = result.entity;
    const detail = await axios.get(`https://sofavpn.com/api/v1/unique-tournament/${e.id}`, { headers });
    const u = detail.data.uniqueTournament;

    const titleHolder = u.titleHolder || {};
    const mostTitles = (u.mostTitlesTeams || []).map(t => t.name).join(', ') || '-';
    const start = u.startDateTimestamp ? dayjs.unix(u.startDateTimestamp).format('D MMMM YYYY') : '-';
    const end = u.endDateTimestamp ? dayjs.unix(u.endDateTimestamp).format('D MMMM YYYY') : '-';

    output += `#${i + 1} - ${u.name}\n`;
    output += `  ➤ Slug Turnamen     : ${u.slug || '-'}\n`;
    output += `  ➤ Wilayah           : ${u.category?.name || '-'}\n`;
    output += `  ➤ Jenis Olahraga    : ${u.category?.sport?.name || '-'}\n`;
    output += `  ➤ Juara Bertahan    : ${titleHolder.name || '-'} (${titleHolder.country?.name || '-'})\n`;
    output += `  ➤ Tim Terbanyak Juara: ${mostTitles}\n`;
    output += `  ➤ Tanggal Mulai     : ${start}\n`;
    output += `  ➤ Tanggal Selesai   : ${end}\n\n`;
  }

  return output.trim();
}

// stalkPlayer('kadek arel').then(console.log);
// stalkTeam('persija').then(console.log);
// stalkMatch('liga 1').then(console.log);

module.exports = {
  stalkPlayer,
  stalkTeam,
  stalkMatch
};