const Text = ({ text }: { text: any }) => {
  if (!text) {
    return null;
  }
  return text.map((value: any) => {
    const {
      annotations: { bold, code, color, italic, strikethrough, underline },
      text,
    } = value;
    return (
      <span
        className={[
          // bold ? styles.bold : '',
          // code ? styles.code : '',
          // italic ? styles.italic : '',
          // strikethrough ? styles.strikethrough : '',
          // underline ? styles.underline : '',
        ].join(' ')}
        style={color !== 'default' ? { color } : {}}
      >
        {text.link ? <a href={text.link.url}>{text.content}</a> : text.content}
      </span>
    );
  });
};

export const renderBlock = (block: any) => {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case 'paragraph':
      return (
        <p>
          <Text text={value.text} />
        </p>
      );
      break;
    case 'heading_1':
      return (
        <h1>
          <Text text={value.text} />
        </h1>
      );
      break;
    case 'heading_2':
      return (
        <h2>
          <Text text={value.text} />
        </h2>
      );
      break;
    case 'heading_3':
      return (
        <h3>
          <Text text={value.text} />
        </h3>
      );
      break;
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return (
        <li>
          <Text text={value.text} />
        </li>
      );
      break;
    case 'to_do':
      return (
        <div>
          <label htmlFor={id}>
            <input type="checkbox" id={id} defaultChecked={value.checked} />{' '}
            <Text text={value.text} />
          </label>
        </div>
      );
      break;
    case 'toggle':
      return (
        <details>
          <summary>
            <Text text={value.text} />
          </summary>
          It's a toggle!
        </details>
      );
      break;
    case 'child_page':
      return <p>{value.title}</p>;
      break;
    default:
      return `❌ Unsupported block (${
        type === 'unsupported' ? 'unsupported by Notion API' : type
      })`;
  }
};
