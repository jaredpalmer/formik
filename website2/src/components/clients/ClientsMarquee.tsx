import React from 'react';
import { Client } from './Client';
import { logos } from './logos';

function splitArray(array: any[], numberOfSplits: number) {
  const splitLength = array.length / numberOfSplits;
  const splits = [];

  for (let i = 0; i < numberOfSplits; i += 1) {
    splits.push(array.slice(i * splitLength, (i + 1) * splitLength));
  }

  return splits;
}

export const ClientsMarquee = React.memo((props) => {
  const [firstLogos, secondLogos] = splitArray(logos, 2);

  return (
    <div className="overflow-x-hidden">
      <div className="relative translate-x-1/2" {...props}>
        <div className="wrapper inline-block">
          {logos.map(({ name, url, image, style }) => (
            <Client
              className="mx-8 align-middle opacity-50"
              key={name}
              style={style}
              name={name}
              image={image}
            />
          ))}
        </div>

        <style jsx global>{`
          @keyframes slidein {
            from {
              transform: translate3d(0, 0, 0);
            }

            to {
              transform: translate3d(-50%, 0, 0);
            }
          }
          .wrapper {
            position: relative;
            white-space: nowrap;
            display: inline-block;
            animation: slidein 100s linear infinite;
            filter: grayscale(100%);
          }
        `}</style>
      </div>
    </div>
  );
});

(ClientsMarquee as any).displayName = 'ClientsMarquee';
