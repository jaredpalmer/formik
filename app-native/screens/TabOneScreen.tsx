import * as React from 'react';
import { Button, StyleSheet, TextInput, Text, unstable_batchedUpdates } from 'react-native';
import { Formik, getBatch } from 'formik';
import EditScreenInfo from '../components/EditScreenInfo';
import { View } from '../components/Themed';
import { RootTabScreenProps } from '../types';

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <Formik initialValues={{ hello: 'world' }} onSubmit={(values) => { alert(JSON.stringify(values, null, 2))}}>
        {formik => (
          <>
            <Text>Is Native Batch: {getBatch() === unstable_batchedUpdates ? "Yes" : "No"}</Text>
            <TextInput onChangeText={formik.handleChange('hello')} value={formik.values.hello} />
            <Button title="Submit" onPress={() => { formik.submitForm(); }} />
          </>
        )}
      </Formik>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <EditScreenInfo path="/screens/TabOneScreen.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
