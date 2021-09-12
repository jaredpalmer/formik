import * as React from 'react';
import { Button } from 'react-native';
import { useSubmitButton } from 'formik-native';

interface SubmitButtonProps {
    title?: string
}

export const SubmitButton = ({ title = "Submit" }) => {
    const { onPress } = useSubmitButton();

    return <Button title={title} onPress={onPress} />;
}