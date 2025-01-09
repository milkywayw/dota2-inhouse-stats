import React, { useState } from 'react';
import { Trophy, Crown } from 'lucide-react';
import Tooltip from '../ui/tooltip';
import HeroSelector from '../ui/selectors/HeroSelector/index';
import PlayerSelector from '../ui/selectors/PlayerSelector/index';
import KDAInput from '../ui/inputs/KdaInput/index';
import { heroes } from '../../data/heroes';
import { players } from '../../data/players';

const ROLES = ['Carry', 'Mid', 'Off', 'Soft', 'Hard'];
const KDA_LABELS = { kills: 'K', deaths: 'D', assists: 'A' };

const MatchForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    notes: '',
    winner: null,
    radiantCaptain: null,
    direCaptain: null,
    radiantBans: Array(7).fill(null),
    direBans: Array(7).fill(null),
    radiantPlayers: Array(5).fill({ player: null, hero: null, kills: '', deaths: '', assists: '' }),
    direPlayers: Array(5).fill({ player: null, hero: null, kills: '', deaths: '', assists: '' }),
  });

  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = true;
    if (!formData.winner) newErrors.winner = true;

    ['radiant', 'dire'].forEach((team) => {
      formData[`${team}Players`].forEach((player, idx) => {
        if (!player.player) newErrors[`${team}Player${idx}`] = true;
        if (!player.hero) newErrors[`${team}Hero${idx}`] = true;
        if (!player.kills) newErrors[`${team}Kills${idx}`] = true;
        if (!player.deaths) newErrors[`${team}Deaths${idx}`] = true;
        if (!player.assists) newErrors[`${team}Assists${idx}`] = true;
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getAvailableHeroes = (currentHero) => {
    const selectedHeroes = [
      ...formData.radiantBans,
      ...formData.direBans,
      ...formData.radiantPlayers.map((p) => p.hero),
      ...formData.direPlayers.map((p) => p.hero),
    ].filter((hero) => hero && hero !== currentHero);

    return heroes.filter((hero) => !selectedHeroes.includes(hero));
  };

  const getAvailablePlayers = (currentPlayer) => {
    const selectedPlayers = [
      ...formData.radiantPlayers.map((p) => p.player),
      ...formData.direPlayers.map((p) => p.player),
    ].filter((player) => player && player !== currentPlayer);

    return players.filter((player) => !selectedPlayers.includes(player));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (validate()) {
      console.log('Form data:', formData);
      // TODO: Submit to your backend
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 transition-colors">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Match Entry</h1>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm mb-1">Date of Inhouse</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`px-3 py-2 rounded border ${errors.date && touched ? 'border-theme-error' : 'border-theme-border'}`}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes about the match"
              className="w-full px-3 py-2 rounded border border-theme-border"
            />
          </div>
        </div>
      </div>

      {/* Bans Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Bans</h2>
        <div className="space-y-4">
          {['radiant', 'dire'].map((team) => (
            <div key={`${team}-bans`}>
              <h3
                className={`text-sm font-medium mb-2 ${team === 'radiant' ? 'text-theme-radiant' : 'text-theme-dire'}`}
              >
                {team.charAt(0).toUpperCase() + team.slice(1)} Bans
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {formData[`${team}Bans`].map((ban, index) => (
                  <HeroSelector
                    key={`${team}-ban-${index}`}
                    selectedHero={ban}
                    onChange={(hero) => {
                      const newBans = [...formData[`${team}Bans`]];
                      newBans[index] = hero;
                      setFormData({ ...formData, [`${team}Bans`]: newBans });
                    }}
                    availableHeroes={getAvailableHeroes(ban)}
                    error={touched && !ban}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Teams Section */}
      {['radiant', 'dire'].map((team) => (
        <div key={team} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Tooltip content={`Mark ${team} team as winner!`}>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, winner: formData.winner === team ? null : team })
                }
                className={`p-2 rounded-full transition-colors border-2 ${
                  formData.winner === team
                    ? 'bg-theme-winner text-theme-winner-text border-theme-winner'
                    : touched && !formData.winner
                      ? 'border-theme-error'
                      : 'border-theme-border-muted hover:border-theme-winner'
                }`}
              >
                <Trophy className="w-5 h-5" />
              </button>
            </Tooltip>
            <h2
              className={`text-xl font-semibold ${team === 'radiant' ? 'text-theme-radiant' : 'text-theme-dire'}`}
            >
              {team.charAt(0).toUpperCase() + team.slice(1)}
            </h2>
          </div>

          <div className="space-y-3">
            {ROLES.map((role, index) => (
              <div key={`${team}-${role}`} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium">{role}</div>
                <div className="w-64">
                  <PlayerSelector
                    selectedPlayer={formData[`${team}Players`][index].player}
                    onChange={(player) => {
                      const newPlayers = [...formData[`${team}Players`]];
                      newPlayers[index] = { ...newPlayers[index], player };
                      setFormData({ ...formData, [`${team}Players`]: newPlayers });
                    }}
                    availablePlayers={getAvailablePlayers(formData[`${team}Players`][index].player)}
                    error={touched && errors[`${team}Player${index}`]}
                  />
                </div>
                <div className="w-64">
                  <HeroSelector
                    selectedHero={formData[`${team}Players`][index].hero}
                    onChange={(hero) => {
                      const newPlayers = [...formData[`${team}Players`]];
                      newPlayers[index] = { ...newPlayers[index], hero };
                      setFormData({ ...formData, [`${team}Players`]: newPlayers });
                    }}
                    availableHeroes={getAvailableHeroes(formData[`${team}Players`][index].hero)}
                    error={touched && errors[`${team}Hero${index}`]}
                  />
                </div>
                <KDAInput
                  kills={formData[`${team}Players`][index].kills}
                  deaths={formData[`${team}Players`][index].deaths}
                  assists={formData[`${team}Players`][index].assists}
                  onChange={(newKDA) => {
                    const newPlayers = [...formData[`${team}Players`]];
                    newPlayers[index] = { ...newPlayers[index], ...newKDA };
                    setFormData({ ...formData, [`${team}Players`]: newPlayers });
                  }}
                  touched={touched}
                  errors={{
                    kills: errors[`${team}Kills${index}`],
                    deaths: errors[`${team}Deaths${index}`],
                    assists: errors[`${team}Assists${index}`],
                  }}
                />
                <Tooltip content="Mark this player as the team drafter!">
                  <button
                    type="button"
                    onClick={() => {
                      if (formData[`${team}Captain`] === index) {
                        setFormData({ ...formData, [`${team}Captain`]: null });
                      } else {
                        setFormData({ ...formData, [`${team}Captain`]: index });
                      }
                    }}
                    className={`p-2 rounded-full transition-colors border-2 ${
                      formData[`${team}Captain`] === index
                        ? 'bg-theme-winner text-theme-winner-text border-theme-winner'
                        : 'border-theme-border-muted hover:border-theme-winner'
                    }`}
                  >
                    <Crown className="w-5 h-5" />
                  </button>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full py-3 rounded bg-theme-primary hover:bg-theme-primary-dark text-theme-primary-text font-medium"
      >
        Submit Match
      </button>
    </div>
  );
};

export default MatchForm;
