export function formatNumber(n) {
    return n.toLocaleString('it-IT');
}

export function formatTime(secondi) {
    const gg  = Math.floor(secondi / 86400);
    const hh  = Math.floor((secondi % 86400) / 3600);
    const min = Math.floor((secondi % 3600) / 60);
    const sec = secondi % 60;

    const parti = [];
    if (gg)  parti.push(`${gg}g`);
    if (hh)  parti.push(`${hh}h`);
    if (min) parti.push(`${min}m`);
    if (sec || parti.length === 0) parti.push(`${sec}s`);

    return parti.join(' ');
}