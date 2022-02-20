import constants from "src/constants";
import {HTTP} from "src/http";

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const getMediaBackend = () => {
  return constants.STORAGE_BACKEND_URL
}

export const downloadTorrent = (torrent) => {
  HTTP.get(`/torrents/get_torrent_file/${torrent.id}`, {
    headers: {
      'Accept': 'application/x-bittorrent'
    },
    responseType: 'blob'
  })
    .then(response => {
      let filename = response.headers['x-filename'];
      let blob = response.data
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    })
    .catch(error => {
      console.log(error)
    })
}

export const capitalize = s => (s && s[0].toUpperCase() + s.slice(1)) || ""

export const groupBy = (xs, f) => {
  let reduced = xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), []);
  return Object.keys(reduced).map(key => {
    return {group: key, children: reduced[key]};
  })
}

