import { Router } from '@angular/router';
import { BaixarProtocoloResponse } from './../services/interfaces/baixar-protocolo/baixar-protocolo-response';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-final',
  templateUrl: './final.page.html',
  styleUrls: ['./final.page.scss'],
})
export class FinalPage implements OnInit {

  localRegistrado = '';

  constructor(private router: Router) { }

  ngOnInit() {
    const routerState = this.router.getCurrentNavigation().extras.state as BaixarProtocoloResponse;
    this.localRegistrado = routerState.dados.localRegistrado;
  }

}
