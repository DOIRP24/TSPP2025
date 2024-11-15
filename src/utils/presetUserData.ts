interface PresetUserData {
  [username: string]: {
    firstName: string;
    lastName: string;
    photoUrl: string;
  };
}

export const presetUserData: PresetUserData = {
  '@kadochkindesign': {
    firstName: 'Максим',
    lastName: 'Кадочкин',
    photoUrl: 'https://static.tildacdn.com/tild3838-3437-4433-a634-353036353333/noroot.png'
  },
  '@maxtytoowork': {
    firstName: 'Анна',
    lastName: 'Смирнова',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
  },
  'tech_lead': {
    firstName: 'Алексей',
    lastName: 'Иванов',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  }
};