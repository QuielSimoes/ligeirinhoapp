export interface ConsultaProtocoloResponse {
    ok: boolean;
    msg: string;
    dados: {
        idTransacao: number;
        nuProtocoloCartorio: string;
    };
}
