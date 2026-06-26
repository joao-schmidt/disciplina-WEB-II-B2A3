package br.edu.ifpr.casalapp.controller;

import br.edu.ifpr.casalapp.dto.TransacaoRequest;
import br.edu.ifpr.casalapp.dto.TransacaoResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin
public class TransacaoController {

    private int proximoId = 4;

    private final List<TransacaoResponse> transacoes = new ArrayList<>(List.of(
            new TransacaoResponse(1, "Supermercado", 350.00, "despesa"),
            new TransacaoResponse(2, "Salário",     4500.00, "receita"),
            new TransacaoResponse(3, "Academia",      99.90, "despesa")
    ));

    @GetMapping("/transacoes")
    public List<TransacaoResponse> listarTransacoes() {
        return transacoes;
    }

    @GetMapping("/transacoes/{id}")
    public ResponseEntity<TransacaoResponse> buscarTransacao(@PathVariable int id) {
        for (TransacaoResponse t : transacoes) {
            if (t.id() == id) {
                return ResponseEntity.ok(t);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/transacoes/{id}")
    public ResponseEntity<Void> deletarTransacao(@PathVariable int id) {
        for (TransacaoResponse t : transacoes) {
            if (t.id() == id) {
                transacoes.remove(t);
                return ResponseEntity.noContent().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/transacoes")
    public ResponseEntity<TransacaoResponse> criarTransacao(@RequestBody TransacaoRequest request) {
        TransacaoResponse novaTransacao = new TransacaoResponse(
                proximoId++,
                request.descricao(),
                request.valor(),
                request.tipo()
        );
        transacoes.add(novaTransacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaTransacao);
    }

    @PatchMapping("/transacoes/{id}")
    public ResponseEntity<TransacaoResponse> atualizarTransacaoParcial(
            @PathVariable int id,
            @RequestBody TransacaoRequest request) {
        
        for (int i = 0; i < transacoes.size(); i++) {
            TransacaoResponse t = transacoes.get(i);
            if (t.id() == id) {
                String novaDescricao = request.descricao() != null ? request.descricao() : t.descricao();
                Double novoValor = request.valor() != null ? request.valor() : t.valor();
                String novoTipo = request.tipo() != null ? request.tipo() : t.tipo();
                
                TransacaoResponse atualizada = new TransacaoResponse(id, novaDescricao, novoValor, novoTipo);
                transacoes.set(i, atualizada);
                return ResponseEntity.ok(atualizada);
            }
        }
        
        return ResponseEntity.notFound().build();
    }
}
