# Facades OCI de type CUD (Create / Update / Delete)

Ce document décrit comment utiliser les façades suivantes pour effectuer des opérations **CUD** (Create / Update / Delete) sur Oracle de façon sûre, avec **transactions**, **COMMIT explicite** et **ROLLBACK automatique** en cas d'erreur :

- `App\Oracle\OciCreateHandler` (INSERT)
- `App\Oracle\OciUpdateHandler` (UPDATE)
- `App\Oracle\OciDeleteHandler` (DELETE)

Toutes ces classes :

- se connectent à Oracle via `oci_connect($user, $password, $dsn, 'AL32UTF8')`,
- préparent les requêtes avec `oci_parse` et `oci_bind_by_name`,
- exécutent avec `OCI_NO_AUTO_COMMIT`,
- font un `oci_commit()` explicite si tout se passe bien,
- et effectuent un `oci_rollback()` systématique en cas d'exception,
- relancent une `RuntimeException` avec un message détaillé (erreur Oracle, SQL, paramètres, schéma courant, user connecté).

> ⚠️ **Important** : ces façades ne font pas de SELECT ; pour la lecture, continuez d'utiliser `App\Oracle\OciFacade::fetchAllAssoc(...)`.

---

## 1. Exemple d'utilisation simple dans un repository

### 1.1. INSERT avec `OciCreateHandler`

```php
use App\Oracle\OciCreateHandler;

class MyRepository
{
    public function __construct(
        private readonly OciCreateHandler $ociCreate,
    ) {}

    public function createUser(int $id, string $name): int
    {
        $sql = "INSERT INTO MY_USERS (ID, NAME) VALUES (:id, :name)";

        $params = [
            'id'   => $id,
            'name' => $name,
        ];

        // Renvoie le nombre de lignes insérées (1 attendu)
        return $ociCreate->insert($sql, $params);
    }
}
```

### 1.2. UPDATE avec `OciUpdateHandler`

```php
use App\Oracle\OciUpdateHandler;

class MyRepository
{
    public function __construct(
        private readonly OciUpdateHandler $ociUpdate,
    ) {}

    public function updateUserName(int $id, string $name): int
    {
        $sql = "UPDATE MY_USERS SET NAME = :name WHERE ID = :id";

        $params = [
            'id'   => $id,
            'name' => $name,
        ];

        // Renvoie le nombre de lignes modifiées
        return $this->ociUpdate->update($sql, $params);
    }
}
```

### 1.3. DELETE avec `OciDeleteHandler`

```php
use App\Oracle\OciDeleteHandler;

class MyRepository
{
    public function __construct(
        private readonly OciDeleteHandler $ociDelete,
    ) {}

    public function deleteUser(int $id): int
    {
        $sql = "DELETE FROM MY_USERS WHERE ID = :id";

        $params = [
            'id' => $id,
        ];

        // Renvoie le nombre de lignes supprimées
        return $this->ociDelete->delete($sql, $params);
    }
}
```

---

## 2. Gestion des erreurs et sécurité

Pour chaque façade :

- Si `oci_parse` échoue → `RuntimeException("OCI parse failed: ...")`.
- Si `oci_execute` échoue → `RuntimeException` avec :
  - message Oracle,
  - code erreur,
  - SQL exécuté,
  - paramètres bindés,
  - schéma courant (`SYS_CONTEXT('USERENV','CURRENT_SCHEMA')`),
  - user connecté (`USER`).
- Avant de relancer l'exception, un `oci_rollback()` est tenté pour annuler la transaction.

Ainsi :

- Si l'opération **réussit** → `COMMIT` explicite, la modification est persistée.
- Si une **erreur** survient (PHP ou Oracle) → `ROLLBACK`, aucune modification partielle en base.

---

## 3. Transactions multi-requêtes (pattern recommandé)

Les façades actuelles encapsulent une transaction **par appel** (`insert` / `update` / `delete`).  
Si vous avez besoin d'enchaîner plusieurs requêtes dans **une seule transaction** (par exemple, plusieurs updates cohérents entre eux), utilisez un service applicatif comme suit :

```php
class ComplexWriteService
{
    public function __construct(
        private readonly OciUpdateHandler $ociUpdate,
        private readonly OciDeleteHandler $ociDelete,
        private readonly OciCreateHandler $ociCreate,
    ) {}

    public function doComplexWrite(array $data): void
    {
        // Exemple : orchestrer manuellement plusieurs appels
        // en gérant la transaction côté Oracle via PL/SQL
        // ou en regroupant la logique dans une procédure stockée.
        //
        // Si vous avez besoin d'une vraie transaction multi-requêtes côté PHP,
        // il est recommandé de factoriser la logique dans une façade dédiée
        // qui utilisera directement oci_execute(OCI_NO_AUTO_COMMIT),
        // oci_commit() et oci_rollback().
    }
}
```

> 💡 Pour des scénarios complexes (plusieurs INSERT/UPDATE/DELETE interdépendants), il peut être pertinent de :
> - Soit regrouper la logique dans une **procédure stockée** Oracle et l'appeler via une seule façade,
> - Soit créer une façade dédiée type `OciTransactionHandler` qui enchaîne plusieurs `oci_execute(..., OCI_NO_AUTO_COMMIT)` avant un `oci_commit()` final.

---

## 4. Bonnes pratiques d'utilisation

- Toujours utiliser des **bind variables** (`:PARAM`) plutôt que de concaténer des valeurs dans le SQL.
- Gérer les exceptions autour des appels `insert` / `update` / `delete` :

```php
try {
    $rows = $this->ociUpdate->update($sql, $params);
} catch (\Throwable $e) {
    // Log technique + message fonctionnel
    // Par ex. logger $e->getMessage() et renvoyer une erreur métier propre à l'API
}
```

- Ne jamais appeler directement `oci_commit` / `oci_rollback` dans les repositories
  si vous utilisez ces façades : elles s'en chargent déjà de façon centralisée.

