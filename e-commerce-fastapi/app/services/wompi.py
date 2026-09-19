"""Utilidades de integridad y validación de eventos Wompi (Colombia)."""

from __future__ import annotations

import hashlib
import hmac
import secrets
from decimal import ROUND_HALF_UP, Decimal
from typing import Any, Mapping


def cop_a_centavos(monto: float | Decimal | str) -> int:
    """Convierte un monto en COP a centavos enteros con redondeo bancario-comercial."""
    valor = (Decimal(str(monto)) * Decimal(100)).quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP,
    )
    return int(valor)


def centavos_a_cop(centavos: int) -> float:
    """Convierte centavos a pesos COP con exactamente 2 decimales."""
    return float(Decimal(centavos) / Decimal(100))


def generar_referencia() -> str:
    """Referencia única alfanumérica estilo CW-ORD-102938."""
    return f"CW-ORD-{secrets.randbelow(900_000) + 100_000}"


def firma_integridad_transaccion(
    referencia: str,
    monto_en_centavos: int,
    moneda: str,
    integrity_secret: str,
) -> str:
    """
    SHA-256 exigido por Wompi Widget/Checkout:
    referencia + montoEnCentavos + moneda + WOMPI_INTEGRITY_SECRET
    """
    cadena = f"{referencia}{monto_en_centavos}{moneda}{integrity_secret}"
    return hashlib.sha256(cadena.encode("utf-8")).hexdigest()


def _valor_por_ruta(data: Mapping[str, Any], ruta: str) -> str:
    """Resuelve paths tipo 'transaction.id' dentro del objeto data del evento."""
    actual: Any = data
    for parte in ruta.split("."):
        if not isinstance(actual, Mapping) or parte not in actual:
            raise ValueError(f"Propiedad de firma no encontrada: {ruta}")
        actual = actual[parte]
    if actual is None:
        return ""
    return str(actual)


def calcular_checksum_evento(
    data: Mapping[str, Any],
    properties: list[str],
    timestamp: int | str,
    events_secret: str,
) -> str:
    """Checksum SHA-256 del evento según documentación oficial de Wompi."""
    partes = [_valor_por_ruta(data, prop) for prop in properties]
    cadena = "".join(partes) + str(timestamp) + events_secret
    return hashlib.sha256(cadena.encode("utf-8")).hexdigest().upper()


def validar_firma_evento(
    payload: Mapping[str, Any],
    events_secret: str,
    checksum_header: str | None = None,
) -> bool:
    """
    Valida que el webhook provenga de Wompi comparando el checksum
    (header X-Event-Checksum o signature.checksum) con el cálculo local.
    """
    if not events_secret:
        return False

    signature = payload.get("signature") or {}
    if not isinstance(signature, Mapping):
        return False

    properties = signature.get("properties")
    timestamp = signature.get("timestamp")
    checksum_body = signature.get("checksum")
    data = payload.get("data")

    if not isinstance(properties, list) or not properties:
        return False
    if timestamp is None or not isinstance(data, Mapping):
        return False

    esperado = calcular_checksum_evento(
        data=data,
        properties=[str(p) for p in properties],
        timestamp=timestamp,
        events_secret=events_secret,
    )

    recibidos = [
        c for c in (checksum_header, checksum_body) if isinstance(c, str) and c
    ]
    if not recibidos:
        return False

    return any(
        hmac.compare_digest(esperado, recibido.strip().upper())
        for recibido in recibidos
    )
