import postmanToOpenApi from 'postman-to-openapi-module';
import HorizontalLineText from './HorizontalLineText';
import Loader from './Loader'
import * as ga from '../lib/ga'
import { useState } from 'react';

function ConvertForm(props) {
  const [fetchingCollection, setFetchingCollection] = useState(false),
    updateConvertedSchema = props.updateConvertedSchema;

  const handleFormSubmit = (event) => {
    event.preventDefault(); // don't redirect the page

    const collectionFile = event.target['collection-file'].files,
      collectionUrl = event.target['collection-url'].value;

    if (collectionFile.length > 0) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = postmanToOpenApi(e.target.result)
        updateConvertedSchema(text);
      };
      reader.readAsText(collectionFile[0])

      ga.event({
        action: 'collection_converted',
        params : {
          type: 'file_upload'
        }
      });

    } else if (collectionUrl.length > 0) {
      setFetchingCollection(true);

      fetch(collectionUrl)
      .then((res) => res.json())
      .then((collectionData) => {
        const openApiSchema = postmanToOpenApi(collectionData)
        updateConvertedSchema(openApiSchema);
      })

      ga.event({
        action: 'collection_converted',
        params : {
          type: 'url'
        }
      });

    } else {
      ga.event({
        action: 'empty_convert_clicked',
        params : { }
      });
    }
  };

  if (fetchingCollection) {
    return <Loader text='Fetching collection' />
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <div className='field'>
        <label htmlFor='collection-url'>Collection URL</label>
        <input type='text' name='collection-url' id='collection-url' placeholder='https://www.postman.com/collections/<COLLECTION-ID>' />
      </div>

      <br />
      <HorizontalLineText text='OR' />
      <br />

      <div className='field'>
        <label htmlFor='collection-file'>Collection File</label>
        <input type='file' name='collection-file' id='collection-file' accept='.json,application/json'/>
      </div>

      <ul className='actions'>
        <li><input type='submit' value='Submit' className='special' /></li>
      </ul>
    </form>
  );
}

export default ConvertForm
