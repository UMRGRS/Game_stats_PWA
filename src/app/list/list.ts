import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  private firestore = inject(Firestore);
  documents: any[] = [];

  async ngOnInit() {
    const snapshot = await getDocs(collection(this.firestore, 'scores'));


    this.documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}