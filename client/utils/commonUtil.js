
function ticktock() {
  let timeout = {};
  return {
    start: (indicator, callback, time) => {
      timeout[indicator] = setTimeout(callback, time);
    },
    stop: (indicator) => {
      clearTimeout(timeout[indicator]);
    }
  };
}

function getPhotoUrl(id, photoName) {
  alertPhotoName(photoName);

  return '/albums/' + id + '/' + photoName;
}

function getThumbUrl(id, photoName) {
  alertPhotoName(photoName);

  let thumbName = getBaseName(photoName) + '-thumb.jpg';

  return '/albums/' + id + '/thumb/' + thumbName;
}

function getBaseName(photoName) {
  alertPhotoName(photoName);

  let extName = getExtName(photoName);
  let baseName = photoName.split(extName);
  baseName.pop();

  return baseName.join('');
}

function getExtName(photoName) {
  alertPhotoName(photoName);

  let startDot = -1;
  for (let i = photoName.length - 1; i > 0; i--) {
    let code = photoName.charCodeAt(i);
    if (code === 47) {
      // 47 means '/'
      break;
    }
    if (code === 46) {
      // 46 means '.'
      startDot = i;
      break;
    }
  }

  if (startDot === -1) {
    return '';
  }

  return photoName.slice(startDot);
}

function alertPhotoName(name) {
  if (typeof name !== 'string') {
    throw new TypeError('Photo name must be a string. Received ' + name);
  }
}

const commonUtil = {
  ticktock: ticktock(),
  getPhotoUrl: getPhotoUrl,
  getThumbUrl: getThumbUrl
};

export default commonUtil;