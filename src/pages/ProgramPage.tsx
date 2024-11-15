import React from 'react';
import { Calendar } from 'lucide-react';

interface ProgramItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
}

interface DayProgram {
  date: Date;
  items: ProgramItem[];
}

const WEEKDAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

const getCurrentWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay - 1));

  return WEEKDAYS.map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
};

const program: DayProgram[] = getCurrentWeekDates().map((date) => ({
  date,
  items: [
    {
      id: `${date.toISOString()}-1`,
      time: '09:00 - 10:30',
      title: 'Утренняя сессия',
      description: 'Обсуждение планов и целей на день',
      location: 'Конференц-зал А'
    },
    {
      id: `${date.toISOString()}-2`,
      time: '11:00 - 13:00',
      title: 'Практический воркшоп',
      description: 'Работа над проектами в группах',
      location: 'Коворкинг'
    },
    {
      id: `${date.toISOString()}-3`,
      time: '14:00 - 16:00',
      title: 'Мастер-класс',
      description: 'Приглашенный эксперт делится опытом',
      location: 'Аудитория 42'
    },
    {
      id: `${date.toISOString()}-4`,
      time: '16:30 - 18:00',
      title: 'Networking',
      description: 'Неформальное общение и обмен опытом',
      location: 'Лаундж-зона'
    }
  ]
}));

export function ProgramPage() {
  const today = new Date();
  const currentDayIndex = today.getDay() - 1; // 0 for Monday, 4 for Friday

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Программа мероприятий</h1>
          <Calendar className="w-8 h-8 text-white opacity-75" />
        </div>
        <p className="text-blue-100 mt-2">
          Расписание на текущую неделю
        </p>
      </div>

      <div className="space-y-6">
        {program.map((day, index) => (
          <div 
            key={day.date.toISOString()}
            className={`bg-white rounded-lg shadow-md overflow-hidden
              ${index === currentDayIndex ? 'ring-2 ring-blue-500' : ''}`}
          >
            <div className={`px-6 py-4 ${
              index === currentDayIndex ? 'bg-blue-50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {WEEKDAYS[index]}
                </h2>
                <span className="text-sm text-gray-500">
                  {day.date.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {day.items.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                      )}
                      {item.location && (
                        <p className="mt-1 text-sm text-gray-500">📍 {item.location}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}