import React from 'react';
import { View0, View4, View9 } from './components/NadiaViews';
import { View1, View2, View3 } from './components/SanchaViews';
import { View5, View7 } from './components/HusnaViews';
import { View6, View8 } from './components/MaulViews';

export default function WebStory1() {
  return (
    <div className="webstory1-wrapper">
      {/* View 0: Cover (Nadia) */}
      <View0 />
      
      {/* View 1, 2, 3: Sancha */}
      <View1 />
      <View2 />
      <View3 />
      
      {/* View 4: Deployment (Nadia) */}
      <View4 />
      
      {/* View 5: Inti Lapangan (Husna) */}
      <View5 />
      
      {/* View 6: Amunisi Tempur (Maul) */}
      <View6 />
      
      {/* View 7: Tantangan/Parallax (Husna) */}
      <View7 />
      
      {/* View 8: Sehat dan Solid (Maul) */}
      <View8 />
      
      {/* View 9: Closing Visual (Nadia) */}
      <View9 />
    </div>
  );
}