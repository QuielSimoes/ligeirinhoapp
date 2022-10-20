import { ApiService } from './../services/api.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-consulta-protocolo',
  templateUrl: './consulta-protocolo.page.html',
  styleUrls: ['./consulta-protocolo.page.scss'],
})
export class ConsultaProtocoloPage implements OnInit {

  constructor(private apiService: ApiService) { }

  ngOnInit() {
  }

  logout() {
    this.apiService.logout();
  }

}
