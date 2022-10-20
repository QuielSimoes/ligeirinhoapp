export interface LoginResponse {
    ok: boolean;
    msg: string;
    dados: {
        id: number;
        nome: string;
        foto: string;
        ultimoAcesso: string;
        token: string;
    };
}
