import React from 'react';
import { Button } from 'primereact/button';
import './index.css';

type Props = {
  chipData?: Record<string, string | number>[];
  handleClick: (keyword: string) => void;
};

export default function PresetButton({ chipData = [], handleClick }: Props) {
  const handleChipClick = (selected: Record<string, string | number>) => {
    return async () => {
      await handleClick(selected['keyword'] as string);
    };
  };

  const renderView = () => {
    return (
      <div className='button-preset'>
        {chipData.map((data) => {
          return (
            <Button
              key={data.key as number}
              label={data.label as string}
              onClick={handleChipClick(data)}
              className={('p-button-sm p-button-rounded ' + data.style) as string}
              icon={(data.key as number) === 0 ? 'pi pi-undo' : undefined}
            />
          );
        })}
      </div>
    );
  };
  return renderView();
}
