import React from 'react';
import { Formik, Form, Field } from 'formik';

// Here is an example of a form with an editable list.
// Next to each input are buttons for insert and remove.
// If the list is empty, there is a button to add an item.
interface FriendListValues {
  friends: string[];
  favoriteNumbers: (number | '')[];
}
export const FriendList = () => (
  <div>
    <h1>Friend List</h1>
    <Formik<FriendListValues>
      initialValues={{
        friends: ['jared', 'ian', 'brent'],
        favoriteNumbers: [4, 8, 16],
      }}
      onSubmit={values => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
        }, 500);
      }}
      render={({ values, TypedFieldArray }) => (
        <Form>
          <TypedFieldArray
            name="friends"
            render={arrayHelpers => (
              <div>
                {values.friends && values.friends.length > 0 ? (
                  values.friends.map((_friend, index) => (
                    <div key={index}>
                      <Field name={`friends.${index}`} />
                      <button
                        type="button"
                        // remove a friend from the list
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        // insert an empty string at a position
                        onClick={() => arrayHelpers.insert(index, '')}
                      >
                        +
                      </button>
                    </div>
                  ))
                ) : (
                  // show this when user has removed all friends from the list
                  <button type="button" onClick={() => arrayHelpers.push('')}>
                    Add a friend
                  </button>
                )}
                <div>
                  <button type="submit">Submit</button>
                </div>
              </div>
            )}
          />
          <TypedFieldArray
            name="favoriteNumbers"
            render={arrayHelpers => (
              <div>
                {values.friends && values.friends.length > 0 ? (
                  values.friends.map((_friend, index) => (
                    <div key={index}>
                      <Field name={`friends.${index}`} />
                      <button
                        type="button"
                        // remove a friend from the list
                        onClick={() => arrayHelpers.remove(index)}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        // insert an empty string at a position,
                        // but if it's a NON-EMPTY string,
                        // it will fail (the field is number | '')
                        onClick={() => arrayHelpers.insert(index, '')}
                      >
                        +
                      </button>
                    </div>
                  ))
                ) : (
                  <button type="button" onClick={() => arrayHelpers.push(32)}>
                    {/* show this when user has removed all friends from the list */}
                    Add a friend
                  </button>
                )}
                <div>
                  <button type="submit">Submit</button>
                </div>
              </div>
            )}
          />
        </Form>
      )}
    />
  </div>
);

export default FriendList;
