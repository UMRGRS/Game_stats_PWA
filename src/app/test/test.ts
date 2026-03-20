import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test implements OnInit {
  private firestore = inject(Firestore);

  async ngOnInit() {
    const snapshot = await getDocs(collection(this.firestore, 'test'));

    snapshot.forEach(doc => {
      console.log(doc.data()); // prints full document data
    });
  }
}
