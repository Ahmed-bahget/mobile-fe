import { Stack } from 'expo-router';

export default function PitchLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#10b981',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Pitch Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Create Pitch',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Pitch',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
