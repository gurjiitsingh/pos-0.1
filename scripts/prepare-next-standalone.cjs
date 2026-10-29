const fs = require('fs');
const path = require('path');

const root = process.cwd();

const standalone = path.join(
  root,
  '.next',
  'standalone'
);

const staticSource = path.join(
  root,
  '.next',
  'static'
);

const staticDestination = path.join(
  standalone,
  '.next',
  'static'
);

const publicSource = path.join(
  root,
  'public'
);

const publicDestination = path.join(
  standalone,
  'public'
);

function copy(source, destination) {
  if (!fs.existsSync(source)) {
    console.log('NOT FOUND:', source);
    return;
  }

  fs.mkdirSync(
    path.dirname(destination),
    {
      recursive: true,
    }
  );

  fs.cpSync(
    source,
    destination,
    {
      recursive: true,
      force: true,
    }
  );

  console.log(
    'COPIED:',
    source,
    '=>',
    destination
  );
}

console.log(
  'PREPARING NEXT.JS STANDALONE'
);

copy(
  staticSource,
  staticDestination
);

copy(
  publicSource,
  publicDestination
);

console.log(
  'NEXT.JS STANDALONE READY'
);